import { Box } from '@chakra-ui/layout'
import { VStack } from '@chakra-ui/react'
import React, { ReactNode } from 'react'

export const Card = ({ children }: { children: ReactNode }): JSX.Element => (
  <Box p={5} borderWidth="thin" borderRadius="md" shadow="md">
    <VStack alignItems="stretch" spacing={5}>
      {children}
    </VStack>
  </Box>
)
