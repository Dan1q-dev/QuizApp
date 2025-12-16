import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

// Animation variants for question content only
const questionContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.25, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.15 }
    }
}

const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.04, duration: 0.2 }
    })
}

// Timer component
function Timer({ startTime }) {
    const [elapsed, setElapsed] = useState(() => Date.now() - startTime)

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime)
        }, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)

    return (
        <div className="flex items-center gap-2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-sm">
                {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    )
}

function QuestionScreen({ question, currentIndex, totalQuestions, startTime, isErrorReviewMode, onAnswer, onNext, onSkip, onExit }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [answerState, setAnswerState] = useState(null) // null | 'correct' | 'incorrect'
    const [showExitModal, setShowExitModal] = useState(false)
    const { theme } = useTheme()

    // Reset state when question changes
    useEffect(() => {
        setSelectedAnswer(null)
        setAnswerState(null)
    }, [question.id])

    const handleSelectAnswer = useCallback((option) => {
        if (answerState) return // Already answered

        setSelectedAnswer(option.letter)
        const isCorrect = option.letter === question.correctAnswer

        if (isCorrect) {
            setAnswerState('correct')
            onAnswer(true, question.question)
        } else {
            setAnswerState('incorrect')
            onAnswer(false, question.question)
        }

        // Auto-advance after 1.5 seconds for both correct and incorrect
        setTimeout(() => {
            onNext()
        }, 1500)
    }, [answerState, question, onAnswer, onNext])

    const handleSkip = useCallback(() => {
        if (answerState) return
        if (onSkip) {
            onSkip(question.question)
        }
    }, [answerState, question.question, onSkip])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (answerState) return // Already answered, ignore keys

            const keyMap = {
                '1': 0, '2': 1, '3': 2, '4': 3, '5': 4,
                'а': 0, 'б': 1, 'в': 2, 'г': 3, 'д': 4, // Russian letters
                'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4  // English letters
            }

            const optionIndex = keyMap[e.key.toLowerCase()]
            if (optionIndex !== undefined && optionIndex < question.options.length) {
                handleSelectAnswer(question.options[optionIndex])
            }

            // Skip with 's' or 'п' (пропустить)
            if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'п') {
                handleSkip()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [answerState, question.options, handleSelectAnswer, handleSkip])

    // Progress: show answered questions count, +1 when current is answered
    const progress = answerState
        ? ((currentIndex + 1) / totalQuestions) * 100
        : (currentIndex / totalQuestions) * 100

    const getOptionClass = (option) => {
        let base = 'option-button w-full p-3 sm:p-4 md:p-5 text-left flex items-start gap-3 sm:gap-4'

        if (answerState) {
            if (option.letter === question.correctAnswer) {
                return `${base} correct`
            }
            if (option.letter === selectedAnswer && answerState === 'incorrect') {
                return `${base} incorrect`
            }
            return `${base} opacity-50`
        }

        return base
    }

    return (
        <div className="h-full w-full flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto">
            <div className="glass-card p-4 sm:p-6 md:p-10 max-w-3xl w-full my-auto relative">
                {/* Exit Button - STATIC */}
                {onExit && (
                    <button
                        onClick={() => setShowExitModal(true)}
                        className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors z-10 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'}`}
                        title="Выйти из теста"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Exit Confirmation Modal */}
                {showExitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 sm:bg-black/50 backdrop-blur-md sm:backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-6 max-w-sm w-full text-center rounded-2xl border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                Выйти из теста?
                            </h3>
                            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                                Прогресс не сохранится. Вы уверены, что хотите выйти?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={() => {
                                        setShowExitModal(false)
                                        onExit()
                                    }}
                                    className="flex-1 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                                >
                                    Выйти
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Progress Section - STATIC */}
                <div className="mb-4 sm:mb-6 md:mb-8 pt-6 sm:pt-0">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                            Вопрос {currentIndex + 1} из {totalQuestions}
                        </span>
                        <div className="flex items-center gap-2 sm:gap-4">
                            {startTime && <Timer startTime={startTime} />}
                            <span className="text-xs sm:text-sm text-indigo-400 font-medium">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                    <div className="progress-bar h-1.5 sm:h-2">
                        <motion.div
                            className="progress-fill"
                            initial={false}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Question Content - ANIMATED */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        variants={questionContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Question */}
                        <h2 className={`text-base sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                            {question.question}
                        </h2>

                        {/* Options - in original order А, Б, В, Г, Д */}
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            {question.options.map((option, index) => (
                                <motion.button
                                    key={option.letter}
                                    custom={index}
                                    variants={optionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    onClick={() => handleSelectAnswer(option)}
                                    disabled={answerState !== null}
                                    className={getOptionClass(option)}
                                >
                                    <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-sm sm:text-lg shrink-0 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200/80 text-slate-700'}`}>
                                        {option.letter.toUpperCase()}
                                    </span>
                                    <span className="text-sm sm:text-base pt-1 sm:pt-2">{option.text}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Skip button */}
                        {!answerState && onSkip && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                    Пропустить<span className="hidden sm:inline"> (S)</span>
                                </button>
                            </div>
                        )}

                        {/* Correct answer indicator */}
                        {answerState === 'correct' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex items-center gap-2 text-green-400 font-medium">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Правильно!
                                </div>
                            </motion.div>
                        )}

                        {/* Wrong answer indicator */}
                        {answerState === 'incorrect' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="inline-flex items-center gap-2 text-red-400 font-medium">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Неправильно
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Keyboard hint - STATIC */}
                <div className={`mt-4 sm:mt-6 pt-3 sm:pt-4 text-center text-[10px] sm:text-xs hidden sm:block ${theme === 'dark' ? 'border-t border-white/10 text-gray-600' : 'border-t border-slate-200 text-slate-400'}`}>
                    Нажмите 1-5 для выбора ответа • S — пропустить
                </div>
            </div>
        </div>
    )
}

export default QuestionScreen
