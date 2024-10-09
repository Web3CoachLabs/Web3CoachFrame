import { colors, createSystem } from 'frog/ui'

export const {
    Box,
    Columns,
    Column,
    Heading,
    HStack,
    Rows,
    Row,
    Spacer,
    Text,
    VStack,
    vars,
    Image,
} = createSystem({
    colors: {
        text: '#000000',
        background: '#ffffff',
        blue: '#0070f3',
        green: '#00ff00',
        red: '#ff0000',
        orange: '#ffaa00',
    },
    fonts: {
        default: [
            {
                // name: 'Gloria Hallelujah',
                name: 'Anton',
                source: 'google',
                weight: 400,
            },
        ],
        madimi: [
            {
                name: 'Madimi One',
                source: 'google',
            },
        ],
    },
})