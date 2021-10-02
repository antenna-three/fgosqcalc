import * as React from 'react'
import {
  ChakraProvider,
  theme,
  FormControl,
  FormLabel,
  Input,
  Container,
  Flex,
  Box,
  Heading,
  VStack,
  StatGroup,
  StatLabel,
  StatNumber,
  Stat,
  Center,
  HStack,
  Divider,
} from '@chakra-ui/react'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { useLocalStorage } from './useLocalStorage'
import { FormEventHandler } from 'react'
import { calcAp } from './calcAp'
import { Card } from './Card'

const getLocalTime = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, -8)
}

export const App = () => {
  const initialTime = getLocalTime()
  const initialState = {
    initialTime,
    initialSaintQuartz: 0,
    initialAp: 0,
    maxAp: 144,
    questAp: 20,
    questLap: 0,
  }
  const [state, setState] = useLocalStorage('state', initialState)

  const handleChange: FormEventHandler<HTMLInputElement> = (event) => {
    const name = event.currentTarget.name as keyof typeof initialState
    const value =
      typeof initialState[name] == 'number'
        ? event.currentTarget.valueAsNumber
        : event.currentTarget.value
    setState((prevState) => ({ ...prevState, [name]: value }))
  }

  const { finalSaintQuartz, finalApMin, finalApMax } = calcAp(
    new Date(state.initialTime),
    new Date(),
    state.initialSaintQuartz,
    state.initialAp,
    state.maxAp,
    state.questAp,
    state.questLap
  )

  return (
    <ChakraProvider theme={theme}>
      <Container>
        <VStack alignItems="stretch">
          <HStack justifyContent="space-between">
            <Heading as="h1" my={5}>
              FGO周回数計算機
            </Heading>
            <ColorModeSwitcher />
          </HStack>
          <form
            onSubmit={(event) => {
              event.preventDefault()
            }}
          >
            <Card>
              <fieldset>
                <VStack alignItems="stretch">
                  <FormLabel as="legend" fontSize="xl">
                    開始時の状態
                  </FormLabel>
                  <Divider />
                  <FormControl id="initial-time">
                    <FormLabel>時刻</FormLabel>
                    <Input
                      type="datetime-local"
                      name="initialTime"
                      value={state.initialTime}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl id="initial-saint-quartz">
                    <FormLabel>聖晶石所持数</FormLabel>
                    <Input
                      type="number"
                      name="initialSaintQuartz"
                      value={state.initialSaintQuartz}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl id="initial-ap">
                    <FormLabel>AP</FormLabel>
                    <Flex align="center">
                      <Input
                        type="number"
                        name="initialAp"
                        value={state.initialAp}
                        onChange={handleChange}
                      />
                      <Box m="1" fontSize="xl">
                        /
                      </Box>
                      <Input
                        type="number"
                        name="maxAp"
                        value={state.maxAp}
                        onChange={handleChange}
                      />
                    </Flex>
                  </FormControl>
                </VStack>
              </fieldset>
              <fieldset>
                <VStack alignItems="stretch">
                  <FormLabel as="legend" fontSize="xl">
                    周回の予定
                  </FormLabel>
                  <Divider />
                  <FormControl id="quest-ap">
                    <FormLabel>消費AP</FormLabel>
                    <Input
                      type="number"
                      name="questAp"
                      value={state.questAp}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl id="quest-lap">
                    <FormLabel>クエスト周回数</FormLabel>
                    <Input
                      type="number"
                      name="questLap"
                      value={state.questLap}
                      onChange={handleChange}
                    />
                  </FormControl>
                </VStack>
              </fieldset>
            </Card>
          </form>
          <Card>
            <Heading fontSize="xl" fontWeight="medium">
              計算結果
            </Heading>
            <StatGroup>
              <Stat>
                <StatLabel>聖晶石所持数</StatLabel>
                <StatNumber>
                  {finalSaintQuartz == null ? '-' : finalSaintQuartz}
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>AP</StatLabel>
                <StatNumber>
                  {finalApMin} ~ {finalApMax}
                </StatNumber>
              </Stat>
            </StatGroup>
          </Card>
        </VStack>
      </Container>
    </ChakraProvider>
  )
}
