import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SubjectIcons } from './SubjectIcons'
import { useTheme } from '../context/ThemeContext'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: 'easeOut' }
    }
}

const buttonVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    }
}

// Circular Progress Component
function CircularProgress({ percentage, size = 48, strokeWidth = 4, color = 'text-indigo-400', theme = 'dark' }) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className={theme === 'dark' ? 'text-white/10' : 'text-slate-200'}
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <motion.circle
                    className={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>{percentage}%</span>
            </div>
        </div>
    )
}

// Subject Selection Screen
function SubjectSelectionScreen({ subjects, subjectVariants, allCompletedVariants, allGlobalStats, allWrongAnswers = {}, onSelectSubject }) {
    const getSubjectProgress = (subject) => {
        const completed = allCompletedVariants[subject.id] || {}
        const stats = allGlobalStats[subject.id] || {}
        const variantData = subjectVariants[subject.id]
        const wrongCount = (allWrongAnswers[subject.id] || []).length

        const totalVariants = variantData?.variantNumbers?.length || 0
        const completedCount = Object.keys(completed).filter(k => k !== 'marathon' && k !== 'errors').length
        const completionPercent = totalVariants > 0 ? Math.round((completedCount / totalVariants) * 100) : 0
        const averagePercent = stats.totalQuestions > 0
            ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
            : 0

        return {
            totalVariants,
            completedCount,
            completionPercent,
            averagePercent,
            totalQuestions: variantData?.totalQuestions || 0,
            wrongCount
        }
    }

    const { theme, toggleTheme } = useTheme()

    return (
        <motion.div
            className="h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="glass-card p-4 sm:p-6 md:p-10 max-w-3xl w-full text-center relative my-auto">
                {/* Theme Toggle */}
                <motion.button
                    variants={itemVariants}
                    onClick={toggleTheme}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200'}`}
                    title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                >
                    {theme === 'dark' ? (
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    )}
                </motion.button>

                {/* Logo/Icon */}
                <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                    <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <svg className="w-7 h-7 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    variants={itemVariants}
                    className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-white via-indigo-200 to-purple-200' : 'from-indigo-600 via-purple-600 to-indigo-600'}`}
                >
                    Подготовка к экзаменам
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={itemVariants} className={`text-sm sm:text-base mb-4 sm:mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                    Выберите предмет для тестирования
                </motion.p>

                {/* Subjects Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6"
                >
                    {subjects.map((subject) => {
                        const progress = getSubjectProgress(subject)
                        const isComplete = progress.completionPercent === 100

                        return (
                            <motion.button
                                key={subject.id}
                                variants={buttonVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectSubject(subject.id)}
                                className={`glass-card p-3 sm:p-5 text-left hover:bg-white/10 transition-colors group relative overflow-hidden ${isComplete ? 'ring-2 ring-green-500/50' : ''}`}
                            >
                                {/* Completion celebration effect */}
                                {isComplete && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
                                )}

                                <div className="flex items-center gap-3 sm:gap-4 relative">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg shrink-0 text-white`}>
                                        {SubjectIcons[subject.id] ? SubjectIcons[subject.id]() : <span className="font-bold text-base sm:text-lg">{subject.shortName.charAt(0)}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm sm:text-base font-semibold transition-colors truncate flex items-center gap-2 ${theme === 'dark' ? 'text-white group-hover:text-indigo-200' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                            {subject.name}
                                            {isComplete && (
                                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                                            {progress.totalQuestions} вопросов • {progress.totalVariants} вариантов
                                            {progress.wrongCount > 0 && (
                                                <span className="text-red-400 ml-2">• {progress.wrongCount} ошибок</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {progress.completedCount > 0 ? (
                                            <CircularProgress
                                                percentage={progress.completionPercent}
                                                size={40}
                                                color={isComplete ? 'text-green-400' : 'text-indigo-500'}
                                                theme={theme}
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                                                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        )
                    })}
                </motion.div>

                {/* Disclaimer */}
                <motion.p
                    variants={itemVariants}
                    className={`text-[10px] sm:text-xs text-center mt-4 ${theme === 'dark' ? 'text-gray-600' : 'text-slate-400'}`}
                >
                    Не является официальным сайтом ЕНУ. Вопросы из открытых источников.
                </motion.p>
            </div>
        </motion.div>
    )
}

// Variant Selection Screen
function VariantSelectionScreen({ subject, variants, completedVariants = {}, globalStats = {}, questionCounts = {}, errorCount = 0, onStartQuiz, onStartErrorReview, onResetStats, onBack }) {
    const [showStats, setShowStats] = useState(false)
    const { theme } = useTheme()

    const isCompleted = (variant) => {
        const key = variant === 'marathon' ? 'marathon' : `variant_${variant}`
        return completedVariants[key]
    }

    const getCompletionInfo = (variant) => {
        const key = variant === 'marathon' ? 'marathon' : `variant_${variant}`
        return completedVariants[key]
    }

    const completedCount = variants.filter(v => isCompleted(v)).length
    const completionPercent = variants.length > 0 ? Math.round((completedCount / variants.length) * 100) : 0
    const isSubjectComplete = completionPercent === 100

    const averagePercent = globalStats.totalQuestions > 0
        ? Math.round((globalStats.totalCorrect / globalStats.totalQuestions) * 100)
        : 0

    const formatTime = (ms) => {
        if (!ms || ms === 0) return '0м'
        const totalMinutes = Math.floor(ms / 60000)
        if (totalMinutes < 60) return `${totalMinutes}м`
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${hours}ч ${minutes}м`
    }

    return (
        <motion.div
            className="h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className={`glass-card p-4 sm:p-6 md:p-10 max-w-2xl w-full text-center relative my-auto ${isSubjectComplete ? 'ring-2 ring-green-500/50' : ''}`}>
                {/* Completion celebration effect */}
                {isSubjectComplete && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-3xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                )}

                {/* Back Button */}
                <motion.button
                    variants={itemVariants}
                    onClick={onBack}
                    className={`absolute top-3 left-3 sm:top-4 sm:left-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm z-10 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500'}`}
                >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Назад</span>
                </motion.button>

                {/* Stats Button */}
                <motion.button
                    variants={itemVariants}
                    onClick={() => setShowStats(!showStats)}
                    className={`absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm z-10 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400' : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500'}`}
                >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {averagePercent}%
                </motion.button>

                {/* Stats Popup */}
                <AnimatePresence>
                    {showStats && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40"
                                onClick={() => setShowStats(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="absolute top-14 right-4 z-50 bg-slate-800/95 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl text-left min-w-[200px]"
                            >
                                <div className="text-sm font-medium text-white mb-3">📊 Статистика</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Попыток:</span>
                                        <span className="text-indigo-400 font-medium">{globalStats.totalAttempts || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Вопросов:</span>
                                        <span className="text-purple-400 font-medium">{globalStats.totalQuestions || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Средний %:</span>
                                        <span className="text-green-400 font-medium">{averagePercent}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Время:</span>
                                        <span className="text-amber-400 font-medium">{formatTime(globalStats.totalTimeMs)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Сбросить статистику?')) {
                                            onResetStats()
                                            setShowStats(false)
                                        }
                                    }}
                                    className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Сбросить
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Subject Icon with Progress */}
                <motion.div variants={itemVariants} className="mb-4 sm:mb-6 mt-8 sm:mt-6 relative">
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-lg relative`}>
                        <span className="text-white font-bold text-lg sm:text-2xl">{subject.shortName.charAt(0)}</span>
                        {isSubjectComplete && (
                            <motion.div
                                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    variants={itemVariants}
                    className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-white via-indigo-200 to-purple-200' : 'from-indigo-600 via-purple-600 to-indigo-600'}`}
                >
                    {subject.name}
                </motion.h1>

                {/* Subtitle with progress */}
                <motion.p variants={itemVariants} className={`text-sm sm:text-base mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                    Выберите вариант или пройдите марафон
                </motion.p>

                {/* Progress bar */}
                <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                    <div className={`flex justify-between text-xs mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-500'}`}>
                        <span>Прогресс</span>
                        <span>{completedCount}/{variants.length} вариантов</span>
                    </div>
                    <div className={`h-1.5 sm:h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <motion.div
                            className={`h-full rounded-full ${isSubjectComplete ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </motion.div>

                {/* Error Review Button */}
                {errorCount > 0 && (
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartErrorReview}
                        className={`w-full py-2.5 sm:py-3 mb-3 sm:mb-4 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition-colors ${theme === 'dark'
                            ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 hover:text-red-200'
                            : 'bg-gradient-to-r from-red-100 to-orange-100 border border-red-300 hover:border-red-400 text-red-700 hover:text-red-800'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Работа над ошибками
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-red-500/30 text-red-200' : 'bg-red-200 text-red-700'
                            }`}>{errorCount}</span>
                    </motion.button>
                )}

                {/* Variants Grid */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6"
                >
                    {variants.map((variant) => {
                        const completed = isCompleted(variant)
                        const info = getCompletionInfo(variant)

                        return (
                            <motion.button
                                key={variant}
                                variants={buttonVariants}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onStartQuiz(variant)}
                                className={`variant-button py-1.5 sm:py-2 px-1 w-11 sm:w-14 relative ${completed ? 'completed' : ''}`}
                            >
                                {completed && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                <div className="text-xs sm:text-sm font-medium">{variant}</div>
                                {completed && info && (
                                    <div className="text-[9px] sm:text-[10px] text-green-400">{info.percentage}%</div>
                                )}
                            </motion.button>
                        )
                    })}
                </motion.div>

                {/* Marathon Button */}
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStartQuiz('marathon')}
                    className={`marathon-button w-full py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center gap-2 relative ${isCompleted('marathon') ? 'completed' : ''}`}
                >
                    {isCompleted('marathon') && (
                        <div className="absolute top-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Марафон
                    <span className="text-xs sm:text-sm opacity-70">({questionCounts.marathon || 0})</span>
                    {isCompleted('marathon') && getCompletionInfo('marathon') && (
                        <span className="text-xs sm:text-sm">— {getCompletionInfo('marathon').percentage}%</span>
                    )}
                </motion.button>

                {/* Footer Stats */}
                <motion.div
                    variants={itemVariants}
                    className={`mt-4 sm:mt-6 pt-3 sm:pt-4 flex justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs ${theme === 'dark' ? 'border-t border-white/10 text-gray-500' : 'border-t border-slate-200 text-slate-500'}`}
                >
                    <div><span className="text-indigo-500 font-semibold">{variants.length}</span> вариантов</div>
                    <div><span className="text-green-500 font-semibold">{completedCount}</span> пройдено</div>
                    {errorCount > 0 && (
                        <div><span className="text-red-400 font-semibold">{errorCount}</span> ошибок</div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    )
}

// Main WelcomeScreen component that switches between modes
function WelcomeScreen({ mode, ...props }) {
    if (mode === 'subjects') {
        return <SubjectSelectionScreen {...props} />
    }
    return <VariantSelectionScreen {...props} />
}

export default WelcomeScreen
