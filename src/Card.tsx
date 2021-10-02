import { Box } from '@chakra-ui/layout'
import { VStack } from '@chakra-ui/react'
import React, { FC } from 'react'

export const Card: FC = ({ children }) => (
  <Box p={5} borderWidth="thin" borderRadius="md" shadow="md">
    <VStack alignItems="stretch" spacing={5}>
      {children}
    </VStack>
  </Box>
)
