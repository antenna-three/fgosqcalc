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
  HStack,
  Button,
  FormHelperText,
  Text,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  InputRightElement,
  InputGroup,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  ButtonGroup,
  Stack,
  useDisclosure,
  InputLeftAddon,
  InputRightAddon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Radio,
  RadioGroup,
} from '@chakra-ui/react'
import { AddIcon, RepeatClockIcon } from '@chakra-ui/icons'
import { ColorModeSwitcher } from './ColorModeSwitcher'
import { useLocalStorage } from './useLocalStorage'
import {
  Dispatch,
  FormEventHandler,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { calcAp } from './calcAp'
import { Card } from './Card'
import { calcBond } from './calcBond'
import { calcQuestBond } from './calcQuestBond'

type State = {
  initialTime: string
  initialSaintQuartz: number
  initialAp: number
  initialBond: number
  maxAp: number
  questAp: number
  questBond: number
  questBondBonus: number
  questLap: number
  totalQuestLap: number
  saintQuartzAddition: number
}

const getLocalTime = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, -8)
}

const getInitialState = (): State => ({
  initialTime: getLocalTime(),
  initialSaintQuartz: 0,
  initialAp: 0,
  initialBond: 0,
  maxAp: 144,
  questAp: 20,
  questBond: 0,
  questBondBonus: 0,
  questLap: 0,
  totalQuestLap: 0,
  saintQuartzAddition: 0,
})

const QuestBondCalculator = ({
  setState,
}: {
  setState: Dispatch<SetStateAction<State>>
}) => {
  const initialLocalState = { questLv: 0, bondBonus: 0, portrait: 0 }
  const [localState, setLocalState] = useState(initialLocalState)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleChange: FormEventHandler<HTMLInputElement> = (event) => {
    const { name, valueAsNumber } = event.currentTarget
    setLocalState((prevState) => ({ ...prevState, [name]: valueAsNumber }))
  }
  const onConfirm = () => {
    setState((prevState) => ({ ...prevState, ...calcQuestBond(localState) }))
    onClose()
  }

  return (
    <>
      <Button onClick={onOpen}>推奨レベルと絆ボーナスから計算</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>獲得絆ポイントを計算する</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <FormControl>
                <FormLabel>クエスト推奨レベル</FormLabel>
                <Input
                  type="number"
                  name="questLv"
                  value={localState.questLv}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>絆ボーナス</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    name="bondBonus"
                    value={localState.bondBonus}
                    onChange={handleChange}
                  />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>英霊肖像</FormLabel>
                <RadioGroup
                  name="portrait"
                  value={localState.portrait.toString()}
                  onChange={(value) => {
                    setLocalState((prevState) => ({
                      ...prevState,
                      portrait: parseInt(value),
                    }))
                  }}
                >
                  <HStack>
                    <Radio value="0">0</Radio>
                    <Radio value="50">1</Radio>
                    <Radio value="100">2</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <ButtonGroup>
                <Button onClick={onClose}>キャンセル</Button>
                <Button onClick={onConfirm}>決定</Button>
              </ButtonGroup>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const AddSaintQuartzPopover = ({
  setState,
}: {
  setState: Dispatch<SetStateAction<State>>
}) => {
  const [saintQuartzToAdd, setSaintQuartzToAdd] = useState(0)
  const saintQuartzAddInputRef = useRef<HTMLInputElement>(null)
  const { onOpen, onClose, isOpen } = useDisclosure()

  const addSaintQuartz = () => {
    setState((prevState) => ({
      ...prevState,
      saintQuartzAddition: prevState.saintQuartzAddition + saintQuartzToAdd,
    }))
    onClose()
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      initialFocusRef={saintQuartzAddInputRef}
    >
      <PopoverTrigger>
        <IconButton aria-label="聖晶石を追加" icon={<AddIcon />} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>聖晶石を追加</PopoverHeader>
        <PopoverBody>
          <Stack>
            <Input
              type="number"
              value={saintQuartzToAdd}
              onChange={(event) => {
                setSaintQuartzToAdd(event.currentTarget.valueAsNumber)
              }}
              ref={saintQuartzAddInputRef}
            />
            <ButtonGroup d="flex" justifyContent="flex-end">
              <Button onClick={onClose} variant="outline">
                キャンセル
              </Button>
              <Button onClick={addSaintQuartz}>決定</Button>
            </ButtonGroup>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const dashForNaN = (value: number) => (isNaN(value) ? '―' : value)

export const App = (): JSX.Element => {
  const initialState = getInitialState()
  const [state, setState] = useLocalStorage('state', initialState)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date())
    }, 5 * 60 * 1000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const apInputRef = React.useRef<HTMLInputElement>(null)

  const { finalSaintQuartz, finalApMin, finalApMax } = calcAp(
    new Date(state.initialTime),
    currentTime,
    state.initialSaintQuartz + state.saintQuartzAddition,
    state.initialAp,
    state.maxAp,
    state.questAp,
    state.questLap
  )

  const isLapTooLarge = finalApMax - finalApMin >= state.questAp

  const finalBond = calcBond(
    state.initialBond,
    state.questBond,
    state.questBondBonus,
    state.questLap
  )

  const handleChange: FormEventHandler<HTMLInputElement> = (event) => {
    const name = event.currentTarget.name as keyof typeof initialState
    const value =
      typeof initialState[name] == 'number'
        ? event.currentTarget.valueAsNumber
        : event.currentTarget.value
    setState((prevState) => ({ ...prevState, [name]: value }))
  }

  const addSaintQuartz: React.MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    const value = parseInt(event.currentTarget.value)
    setState((prevState) => ({
      ...prevState,
      saintQuartzAddition: prevState.saintQuartzAddition + value,
    }))
  }

  const addLap = () => {
    setState((prevState) => ({
      ...prevState,
      initialTime: getLocalTime(),
      initialSaintQuartz: finalSaintQuartz,
      initialAp: finalApMax,
      initialBond: finalBond,
      totalQuestLap: prevState.totalQuestLap + prevState.questLap,
    }))
    setCurrentTime(new Date())
    if (apInputRef.current != null) {
      apInputRef.current.focus()
    }
  }

  const resetTime = () => {
    setState((prevState) => ({ ...prevState, initialTime: getLocalTime() }))
    setCurrentTime(new Date())
  }

  const resetLap = () => {
    setState((prevState) => ({ ...prevState, totalQuestLap: 0 }))
  }

  const resetAll = () => {
    setState(getInitialState())
    setCurrentTime(new Date())
  }

  return (
    <ChakraProvider theme={theme}>
      <Container paddingBottom={20}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <VStack alignItems="stretch">
            <HStack justifyContent="space-between">
              <Heading as="h1" my={5}>
                FGO AP Calculator
              </Heading>
              <ColorModeSwitcher />
            </HStack>
            <Text>
              聖晶石を消費する周回において、目標周回数に達したときの聖晶石所持数とAPを計算します。
            </Text>
            <Card>
              <fieldset>
                <VStack alignItems="stretch">
                  <FormLabel as="legend" fontSize="xl">
                    周回開始時の状態
                  </FormLabel>
                  <FormControl id="initial-time">
                    <FormLabel>時刻</FormLabel>
                    <InputGroup>
                      <Input
                        type="datetime-local"
                        name="initialTime"
                        value={state.initialTime}
                        onChange={handleChange}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="現在時刻を更新"
                          icon={<RepeatClockIcon />}
                          onClick={resetTime}
                        />
                      </InputRightElement>
                    </InputGroup>
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
                        ref={apInputRef}
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
            </Card>
            <Card>
              <fieldset>
                <VStack alignItems="stretch">
                  <FormLabel as="legend" fontSize="xl">
                    クエスト情報
                  </FormLabel>
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
                    <FormLabel>周回予定数</FormLabel>
                    <Input
                      type="number"
                      name="questLap"
                      value={state.questLap}
                      onChange={handleChange}
                      isInvalid={isLapTooLarge}
                    />
                    {isLapTooLarge && (
                      <FormHelperText>
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          周回数が大きすぎます。絆カウントを併用するか、周回数を100周程度に分割して、「周回を継続する」ボタンを使って少しずつ計測するようにしてください。
                        </Alert>
                      </FormHelperText>
                    )}
                  </FormControl>
                </VStack>
              </fieldset>
            </Card>
            <Box borderWidth="thin" borderRadius="md" shadow="md">
              <Accordion allowToggle>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        絆カウント
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel px={5}>
                    <VStack>
                      <FormControl>
                        <FormLabel>開始時の累計絆ポイント</FormLabel>
                        <Input
                          type="number"
                          name="initialBond"
                          value={state.initialBond}
                          onChange={handleChange}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>獲得絆ポイント</FormLabel>
                        <HStack>
                          <Input
                            type="number"
                            name="questBond"
                            value={state.questBond}
                            onChange={handleChange}
                          />
                          <InputGroup>
                            <InputLeftAddon>+</InputLeftAddon>
                            <Input
                              type="number"
                              name="questBondBonus"
                              value={state.questBondBonus}
                              onChange={handleChange}
                            />
                          </InputGroup>
                          <Text whiteSpace="nowrap">
                            = {state.questBond + state.questBondBonus}
                          </Text>
                        </HStack>
                      </FormControl>
                      <QuestBondCalculator setState={setState} />
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
            <Card>
              <FormControl id="saint-quartz-addition">
                <FormLabel>周回中の聖晶石増減</FormLabel>
                <Input
                  type="number"
                  name="saintQuartzAddition"
                  value={state.saintQuartzAddition}
                  onChange={handleChange}
                />
                <ButtonGroup marginTop={3}>
                  {[-1, 1, 2, 3].map((value) => (
                    <Button
                      type="button"
                      value={value}
                      onClick={addSaintQuartz}
                      key={value}
                    >
                      {value > 0 ? '+' : ''}
                      {value}
                    </Button>
                  ))}
                  <AddSaintQuartzPopover setState={setState} />
                </ButtonGroup>
                <FormHelperText>
                  聖晶石召喚を行ったとき、絆レベルアップ報酬やログインボーナスを受け取ったときは忘れず追加してください。
                </FormHelperText>
              </FormControl>
            </Card>
            <Card>
              <Heading fontSize="xl" fontWeight="medium">
                計算結果
              </Heading>
              <StatGroup>
                <Stat>
                  <StatLabel>累計周回数</StatLabel>
                  <StatNumber>
                    {dashForNaN(state.totalQuestLap + state.questLap)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>聖晶石所持数</StatLabel>
                  <StatNumber>{dashForNaN(finalSaintQuartz)}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>AP</StatLabel>
                  <StatNumber>
                    {dashForNaN(finalApMin)} ~ {dashForNaN(finalApMax)}
                  </StatNumber>
                </Stat>
              </StatGroup>
              {!isNaN(finalBond) && (
                <Stat>
                  <StatLabel>累計絆ポイント</StatLabel>
                  <StatNumber>{finalBond}</StatNumber>
                </Stat>
              )}
            </Card>
            <Button type="button" onClick={addLap} colorScheme="twitter">
              周回を継続する
            </Button>
            <Button type="button" onClick={resetLap}>
              累計周回数をリセット
            </Button>
            <Button type="button" onClick={resetAll}>
              入力内容をすべてリセット
            </Button>
          </VStack>
        </form>
      </Container>
    </ChakraProvider>
  )
}
