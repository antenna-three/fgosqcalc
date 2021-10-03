/* eslint-disable @typescript-eslint/ban-types */
import { Box, ChakraComponent, VStack } from '@chakra-ui/react'
import React from 'react'

export const Card: ChakraComponent<'div', {}> = ({ children }) => (
  <Box p={5} borderWidth="thin" borderRadius="md" shadow="md">
    <VStack alignItems="stretch" spacing={5}>
      {children}
    </VStack>
  </Box>
)
