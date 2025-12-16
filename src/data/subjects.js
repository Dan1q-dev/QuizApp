// Subject configuration for multi-subject quiz support
// Each subject has its data file, display name, and variant settings

import standardsData from './standards.json'
import prologData from './prolog.json'
import cultureData from './culture.json'
import philData from './phil.json'
import politoData from './polito.json'
import psihoData from './psiho.json'
import socData from './soc.json'

export const subjects = [
    {
        id: 'standards',
        name: 'Стандарты ПО',
        shortName: 'СПО',
        data: standardsData,
        hasVariants: true,
        questionsPerVariant: 40,
        color: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'prolog',
        name: 'Пролог',
        shortName: 'Пролог',
        data: prologData,
        hasVariants: true,
        questionsPerVariant: 40,
        color: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'culture',
        name: 'Культурология',
        shortName: 'Культура',
        data: cultureData,
        hasVariants: false,
        questionsPerVariant: 40,
        color: 'from-amber-500 to-orange-600'
    },
    {
        id: 'phil',
        name: 'Философия',
        shortName: 'Фило',
        data: philData,
        hasVariants: false,
        questionsPerVariant: 40,
        color: 'from-rose-500 to-pink-600'
    },
    {
        id: 'polito',
        name: 'Политология',
        shortName: 'Полит',
        data: politoData,
        hasVariants: false,
        questionsPerVariant: 40,
        color: 'from-blue-500 to-cyan-600'
    },
    {
        id: 'psiho',
        name: 'Психология',
        shortName: 'Психо',
        data: psihoData,
        hasVariants: false,
        questionsPerVariant: 40,
        color: 'from-violet-500 to-purple-600'
    },
    {
        id: 'soc',
        name: 'Социология',
        shortName: 'Соц',
        data: socData,
        hasVariants: false,
        questionsPerVariant: 40,
        color: 'from-lime-500 to-green-600'
    }
]

export const getSubjectById = (id) => subjects.find(s => s.id === id)
