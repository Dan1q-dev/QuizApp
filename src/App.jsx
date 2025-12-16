import { useState, useMemo, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import WelcomeScreen from './components/WelcomeScreen'
import QuestionScreen from './components/QuestionScreen'
import ResultScreen from './components/ResultScreen'
import { subjects, getSubjectById } from './data/subjects'

// Seeded random number generator (mulberry32)
const createSeededRandom = (seed) => {
    let state = seed
    return () => {
        state = (state + 0x6D2B79F5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

// Generate a numeric seed from string (for subject ID)
const stringToSeed = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
}

// Fisher-Yates shuffle with seeded random (deterministic)
const shuffleArraySeeded = (array, seed) => {
    const random = createSeededRandom(seed)
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Fisher-Yates shuffle (random, for quiz session)
const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Shuffle answer options and update correct answer accordingly
const shuffleOptions = (question) => {
    const letters = ['а', 'б', 'в', 'г', 'д']
    const shuffledOptions = shuffleArray([...question.options])

    // Find correct answer text before shuffling
    const correctOption = question.options.find(o => o.letter === question.correctAnswer)
    if (!correctOption) return question

    const correctText = correctOption.text

    // Assign new letters to shuffled options
    const newOptions = shuffledOptions.map((opt, i) => ({
        letter: letters[i],
        text: opt.text
    }))

    // Find new correct answer letter
    const newCorrectAnswer = newOptions.find(o => o.text === correctText)?.letter || question.correctAnswer

    return {
        ...question,
        options: newOptions,
        correctAnswer: newCorrectAnswer
    }
}

// Generate variants for databases without predefined variants
// Smart logic: if remainder > 20, create separate variant; if <= 20, add to last variant
// Uses seeded random for stable variants across sessions
const generateVariantsFromFlat = (allQuestions, questionsPerVariant = 40, subjectId = 'default') => {
    const numFullVariants = Math.floor(allQuestions.length / questionsPerVariant)
    const remainder = allQuestions.length % questionsPerVariant

    // Use seeded shuffle for stable variant composition
    const seed = stringToSeed(subjectId + '_variants')
    const shuffled = shuffleArraySeeded([...allQuestions], seed)

    const variants = {}

    // Determine if we should create an extra variant for remainder
    // If remainder > 20, create separate variant; otherwise add to last full variant
    const createExtraVariant = remainder > 20
    const numVariants = remainder > 0 && createExtraVariant ? numFullVariants + 1 : Math.max(1, numFullVariants)

    for (let i = 0; i < numVariants; i++) {
        const variantNum = i + 1
        let startIdx, endIdx

        if (createExtraVariant) {
            // All variants have exactly questionsPerVariant, except last one has remainder
            startIdx = i * questionsPerVariant
            endIdx = i < numFullVariants ? (i + 1) * questionsPerVariant : shuffled.length
        } else {
            // Last variant gets remainder added to it
            const isLastVariant = i === numVariants - 1
            startIdx = i * questionsPerVariant
            endIdx = isLastVariant ? shuffled.length : (i + 1) * questionsPerVariant
        }

        const variantQuestions = shuffled.slice(startIdx, endIdx)
        variants[variantNum] = variantQuestions.map((q, idx) => ({
            ...q,
            id: `${variantNum}-${idx + 1}`,
            variant: variantNum
        }))
    }

    return variants
}




// localStorage helpers
const getStorageKey = (subjectId, type) => `quiz_${subjectId}_${type}`

const loadFromStorage = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : defaultValue
    } catch {
        return defaultValue
    }
}

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch {
        console.warn('Failed to save to localStorage')
    }
}

function App() {
    const [screen, setScreen] = useState('subjects') // 'subjects' | 'welcome' | 'quiz' | 'result'
    const [selectedSubject, setSelectedSubject] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [startTime, setStartTime] = useState(null)
    const [endTime, setEndTime] = useState(null)
    const [isErrorReviewMode, setIsErrorReviewMode] = useState(false)

    // Track wrong answers during current quiz session
    const wrongAnswersThisSession = useRef([])

    // Per-subject completed variants
    const [completedVariants, setCompletedVariants] = useState(() => {
        const all = {}
        subjects.forEach(s => {
            all[s.id] = loadFromStorage(getStorageKey(s.id, 'variants'), {})
        })
        return all
    })

    // Per-subject statistics
    const [globalStats, setGlobalStats] = useState(() => {
        const all = {}
        subjects.forEach(s => {
            all[s.id] = loadFromStorage(getStorageKey(s.id, 'stats'), {
                totalAttempts: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                totalTimeMs: 0
            })
        })
        return all
    })

    // Per-subject wrong answers for error review mode
    const [wrongAnswers, setWrongAnswers] = useState(() => {
        const all = {}
        subjects.forEach(s => {
            all[s.id] = loadFromStorage(getStorageKey(s.id, 'wrong'), [])
        })
        return all
    })

    // Pre-generate variants for subjects without predefined variants
    const subjectVariants = useMemo(() => {
        const result = {}
        subjects.forEach(subject => {
            if (subject.hasVariants) {
                // Extract variants from data
                const uniqueVariants = [...new Set(subject.data.map(q => q.variant))].sort((a, b) => a - b)
                result[subject.id] = {
                    variantNumbers: uniqueVariants,
                    questionsByVariant: uniqueVariants.reduce((acc, v) => {
                        acc[v] = subject.data.filter(q => q.variant === v)
                        return acc
                    }, {}),
                    totalQuestions: subject.data.length
                }
            } else {
                // Generate variants from flat list (stable across sessions)
                const generated = generateVariantsFromFlat(subject.data, subject.questionsPerVariant, subject.id)
                const variantNumbers = Object.keys(generated).map(Number).sort((a, b) => a - b)
                result[subject.id] = {
                    variantNumbers,
                    questionsByVariant: generated,
                    totalQuestions: subject.data.length
                }
            }
        })
        return result
    }, [])

    // Get current subject data
    const currentSubjectData = selectedSubject ? subjectVariants[selectedSubject.id] : null

    const handleSelectSubject = (subjectId) => {
        const subject = getSubjectById(subjectId)
        setSelectedSubject(subject)
        setScreen('welcome')
    }

    const handleBackToSubjects = () => {
        setSelectedSubject(null)
        setScreen('subjects')
    }

    const handleStartQuiz = (variant) => {
        if (!selectedSubject || !currentSubjectData) return

        let filteredQuestions
        wrongAnswersThisSession.current = []
        setIsErrorReviewMode(false)

        if (variant === 'marathon') {
            // Marathon: all questions shuffled (no limit)
            filteredQuestions = shuffleArray([...selectedSubject.data])
        } else {
            // Specific variant - get all variant questions
            const variantQuestions = currentSubjectData.questionsByVariant[variant] || []
            filteredQuestions = shuffleArray([...variantQuestions])
        }

        // Shuffle answer options for each question
        filteredQuestions = filteredQuestions.map(shuffleOptions)

        setSelectedVariant(variant)
        setQuestions(filteredQuestions)
        setCurrentIndex(0)
        setScore(0)
        setStartTime(Date.now())
        setEndTime(null)
        setScreen('quiz')
    }

    // Start error review mode
    const handleStartErrorReview = () => {
        if (!selectedSubject) return

        const subjectId = selectedSubject.id
        const wrongTexts = wrongAnswers[subjectId] || []

        if (wrongTexts.length === 0) return

        // Find questions by their text content (since IDs change each session)
        const wrongQuestions = selectedSubject.data.filter(q => wrongTexts.includes(q.question))

        if (wrongQuestions.length === 0) return

        wrongAnswersThisSession.current = []
        setIsErrorReviewMode(true)

        // Shuffle questions and their options
        let filteredQuestions = shuffleArray([...wrongQuestions])
        filteredQuestions = filteredQuestions.map(shuffleOptions)

        setSelectedVariant('errors')
        setQuestions(filteredQuestions)
        setCurrentIndex(0)
        setScore(0)
        setStartTime(Date.now())
        setEndTime(null)
        setScreen('quiz')
    }

    const handleAnswer = (isCorrect, questionText) => {
        if (isCorrect) {
            setScore(prev => prev + 1)

            // If in error review mode and answered correctly, remove from wrong answers
            if (isErrorReviewMode && selectedSubject) {
                const subjectId = selectedSubject.id
                setWrongAnswers(prev => {
                    const updated = {
                        ...prev,
                        [subjectId]: (prev[subjectId] || []).filter(text => text !== questionText)
                    }
                    saveToStorage(getStorageKey(subjectId, 'wrong'), updated[subjectId])
                    return updated
                })
            }
        } else {
            // Track wrong answer by question text
            wrongAnswersThisSession.current.push(questionText)
        }
    }

    const handleNextQuestion = () => {
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1)
        } else {
            const now = Date.now()
            setEndTime(now)

            const subjectId = selectedSubject.id

            // Calculate final score: current score + 1 if last question was not a wrong answer
            // We need to check wrongAnswersThisSession to determine if last answer was correct
            const wrongCount = wrongAnswersThisSession.current.length
            const finalScore = questions.length - wrongCount

            // Save wrong answers from this session (only for non-error-review mode)
            if (!isErrorReviewMode && wrongAnswersThisSession.current.length > 0) {
                setWrongAnswers(prev => {
                    const existing = prev[subjectId] || []
                    // Merge and dedupe
                    const merged = [...new Set([...existing, ...wrongAnswersThisSession.current])]
                    const updated = { ...prev, [subjectId]: merged }
                    saveToStorage(getStorageKey(subjectId, 'wrong'), merged)
                    return updated
                })
            }

            // Calculate results using finalScore (not stale score state)
            const percentage = Math.round((finalScore / questions.length) * 100)
            const variantKey = selectedVariant === 'marathon' ? 'marathon' : selectedVariant === 'errors' ? 'errors' : `variant_${selectedVariant}`
            const elapsedMs = now - startTime

            // Update completed variants (best score) - skip for error review
            if (!isErrorReviewMode) {
                setCompletedVariants(prev => {
                    const subjectVariantsData = prev[subjectId] || {}
                    const existing = subjectVariantsData[variantKey]
                    if (!existing || percentage > existing.percentage) {
                        const updated = {
                            ...prev,
                            [subjectId]: {
                                ...subjectVariantsData,
                                [variantKey]: {
                                    score: finalScore,
                                    total: questions.length,
                                    percentage,
                                    completedAt: now
                                }
                            }
                        }
                        saveToStorage(getStorageKey(subjectId, 'variants'), updated[subjectId])
                        return updated
                    }
                    return prev
                })
            }

            // Update global stats
            setGlobalStats(prev => {
                const subjectStats = prev[subjectId] || {
                    totalAttempts: 0,
                    totalQuestions: 0,
                    totalCorrect: 0,
                    totalTimeMs: 0
                }
                const updated = {
                    ...prev,
                    [subjectId]: {
                        totalAttempts: subjectStats.totalAttempts + 1,
                        totalQuestions: subjectStats.totalQuestions + questions.length,
                        totalCorrect: subjectStats.totalCorrect + finalScore,
                        totalTimeMs: subjectStats.totalTimeMs + elapsedMs
                    }
                }
                saveToStorage(getStorageKey(subjectId, 'stats'), updated[subjectId])
                return updated
            })

            setScreen('result')
        }
    }

    const handleRestart = () => {
        if (isErrorReviewMode) {
            handleStartErrorReview()
        } else {
            handleStartQuiz(selectedVariant)
        }
    }

    const handleMenu = () => {
        setScreen('welcome')
        setSelectedVariant(null)
        setQuestions([])
        setCurrentIndex(0)
        setScore(0)
        setStartTime(null)
        setEndTime(null)
        setIsErrorReviewMode(false)
    }

    const handleSkipQuestion = (questionId) => {
        // Move current question to the end of the queue
        setQuestions(prev => {
            const current = prev[currentIndex]
            const newQuestions = [...prev]
            newQuestions.splice(currentIndex, 1)
            newQuestions.push(current)
            return newQuestions
        })
        // Don't increment currentIndex since we removed the current question
    }

    const handleResetStats = () => {
        if (!selectedSubject) return

        const subjectId = selectedSubject.id
        setCompletedVariants(prev => {
            const updated = { ...prev, [subjectId]: {} }
            saveToStorage(getStorageKey(subjectId, 'variants'), {})
            return updated
        })
        setGlobalStats(prev => {
            const emptyStats = {
                totalAttempts: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                totalTimeMs: 0
            }
            const updated = { ...prev, [subjectId]: emptyStats }
            saveToStorage(getStorageKey(subjectId, 'stats'), emptyStats)
            return updated
        })
        setWrongAnswers(prev => {
            const updated = { ...prev, [subjectId]: [] }
            saveToStorage(getStorageKey(subjectId, 'wrong'), [])
            return updated
        })
    }

    // Get question counts for current subject
    const questionCounts = useMemo(() => {
        if (!selectedSubject || !currentSubjectData) return {}

        const counts = {}
        currentSubjectData.variantNumbers.forEach(v => {
            const variantQuestions = currentSubjectData.questionsByVariant[v] || []
            counts[v] = Math.min(variantQuestions.length, selectedSubject.questionsPerVariant)
        })
        counts.marathon = currentSubjectData.totalQuestions
        return counts
    }, [selectedSubject, currentSubjectData])

    // Get error count for current subject
    const errorCount = selectedSubject ? (wrongAnswers[selectedSubject.id] || []).length : 0

    return (
        <div className="h-full w-full overflow-hidden">
            <AnimatePresence mode="wait">
                {screen === 'subjects' && (
                    <WelcomeScreen
                        key="subjects"
                        mode="subjects"
                        subjects={subjects}
                        subjectVariants={subjectVariants}
                        allCompletedVariants={completedVariants}
                        allGlobalStats={globalStats}
                        allWrongAnswers={wrongAnswers}
                        onSelectSubject={handleSelectSubject}
                    />
                )}

                {screen === 'welcome' && selectedSubject && (
                    <WelcomeScreen
                        key={`welcome-${selectedSubject.id}`}
                        mode="variants"
                        subject={selectedSubject}
                        variants={currentSubjectData?.variantNumbers || []}
                        completedVariants={completedVariants[selectedSubject.id] || {}}
                        globalStats={globalStats[selectedSubject.id] || {}}
                        questionCounts={questionCounts}
                        errorCount={errorCount}
                        onStartQuiz={handleStartQuiz}
                        onStartErrorReview={handleStartErrorReview}
                        onResetStats={handleResetStats}
                        onBack={handleBackToSubjects}
                    />
                )}

                {screen === 'quiz' && questions.length > 0 && (
                    <QuestionScreen
                        key={`quiz-${currentIndex}`}
                        question={questions[currentIndex]}
                        currentIndex={currentIndex}
                        totalQuestions={questions.length}
                        startTime={startTime}
                        isErrorReviewMode={isErrorReviewMode}
                        onAnswer={handleAnswer}
                        onNext={handleNextQuestion}
                        onSkip={handleSkipQuestion}
                        onExit={handleMenu}
                    />
                )}

                {screen === 'result' && (
                    <ResultScreen
                        key="result"
                        score={score}
                        totalQuestions={questions.length}
                        startTime={startTime}
                        endTime={endTime}
                        isErrorReviewMode={isErrorReviewMode}
                        onRestart={handleRestart}
                        onMenu={handleMenu}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default App
