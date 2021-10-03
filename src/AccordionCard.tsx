import {
  Accordion,
  AccordionProps,
  Box,
  ComponentWithAs,
} from '@chakra-ui/react'
import React from 'react'

export const AccordionCard: ComponentWithAs<'div', AccordionProps> = ({
  children,
}) => (
  <Box borderWidth="thin" borderRadius="md" shadow="md">
    <Accordion allowToggle>{children}</Accordion>
  </Box>
)
