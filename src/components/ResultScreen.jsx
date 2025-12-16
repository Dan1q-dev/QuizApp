import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useTheme } from '../context/ThemeContext'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.25, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15 }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05 + 0.1, duration: 0.25 }
    })
}

function ResultScreen({ score, totalQuestions, startTime, endTime, isErrorReviewMode, onRestart, onMenu }) {
    const percentage = Math.round((score / totalQuestions) * 100)
    const { theme } = useTheme()

    // Confetti effect for 100% score
    useEffect(() => {
        if (percentage === 100) {
            // Fire confetti from both sides
            const duration = 3000
            const end = Date.now() + duration

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.7 },
                    colors: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308']
                })
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.7 },
                    colors: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308']
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }

            // Big burst first
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308']
            })

            frame()
        } else if (percentage >= 80) {
            // Smaller celebration for 80%+
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#22c55e', '#10b981', '#6366f1']
            })
        }
    }, [percentage])

    // Calculate elapsed time
    const timeString = useMemo(() => {
        if (!startTime || !endTime) return '0:00'
        const elapsedMs = endTime - startTime
        const minutes = Math.floor(elapsedMs / 60000)
        const seconds = Math.floor((elapsedMs % 60000) / 1000)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }, [startTime, endTime])

    // Determine result color and message
    const getResultStyle = () => {
        if (percentage === 100) {
            return {
                gradient: 'from-yellow-400 via-green-400 to-emerald-500',
                shadow: 'shadow-yellow-500/30',
                message: 'Идеальный результат! 🎉✨',
                bg: 'from-yellow-500/20 to-emerald-500/20'
            }
        } else if (percentage >= 80) {
            return {
                gradient: 'from-green-400 to-emerald-500',
                shadow: 'shadow-green-500/30',
                message: 'Отличный результат! 🎉',
                bg: 'from-green-500/20 to-emerald-500/20'
            }
        } else if (percentage >= 60) {
            return {
                gradient: 'from-yellow-400 to-amber-500',
                shadow: 'shadow-yellow-500/30',
                message: 'Хороший результат! 👍',
                bg: 'from-yellow-500/20 to-amber-500/20'
            }
        } else {
            return {
                gradient: 'from-red-400 to-rose-500',
                shadow: 'shadow-red-500/30',
                message: 'Нужна практика 📚',
                bg: 'from-red-500/20 to-rose-500/20'
            }
        }
    }

    const resultStyle = getResultStyle()

    return (
        <motion.div
            className="h-full w-full flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="glass-card p-6 sm:p-8 md:p-12 max-w-xl w-full text-center my-auto">
                {/* Trophy Icon */}
                <motion.div
                    custom={0}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-4 sm:mb-6 md:mb-8"
                >
                    <div className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-full bg-gradient-to-br ${resultStyle.bg} flex items-center justify-center`}>
                        <span className="text-4xl sm:text-5xl md:text-6xl">
                            {percentage === 100 ? '👑' : percentage >= 80 ? '🏆' : percentage >= 60 ? '🎯' : '📖'}
                        </span>
                    </div>
                </motion.div>

                {/* Error review badge */}
                {isErrorReviewMode && (
                    <motion.div
                        custom={0.5}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="mb-3 sm:mb-4"
                    >
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs sm:text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Работа над ошибками
                        </span>
                    </motion.div>
                )}

                {/* Message */}
                <motion.h2
                    custom={1}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={`text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                >
                    {resultStyle.message}
                </motion.h2>

                {/* Score */}
                <motion.div
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6 sm:mb-8"
                >
                    <div className={`text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r ${resultStyle.gradient} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                        {percentage}%
                    </div>
                    <p className={`text-sm sm:text-base md:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                        {score} из {totalQuestions} правильных ответов
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    custom={3}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10"
                >
                    <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-red-50 border border-red-100'}`}>
                        <div className="text-2xl sm:text-3xl font-bold text-red-400 mb-0.5 sm:mb-1">
                            {totalQuestions - score}
                        </div>
                        <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Ошибок</div>
                    </div>
                    <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-purple-50 border border-purple-100'}`}>
                        <div className="text-2xl sm:text-3xl font-bold text-purple-500 mb-0.5 sm:mb-1">
                            {timeString}
                        </div>
                        <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Время</div>
                    </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    custom={4}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex gap-3 sm:gap-4"
                >
                    <button
                        onClick={onRestart}
                        className="glass-button flex-1 py-3 sm:py-4 text-sm sm:text-base md:text-lg flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline">Ещё раз</span>
                        <span className="sm:hidden">Ещё</span>
                    </button>
                    <button
                        onClick={onMenu}
                        className="menu-button flex-1 py-3 sm:py-4 text-sm sm:text-base md:text-lg flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Меню
                    </button>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default ResultScreen
