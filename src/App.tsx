import React from 'react'
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
  Badge,
  OrderedList,
  ListItem,
  Link,
} from '@chakra-ui/react'
import { RepeatClockIcon, SmallAddIcon } from '@chakra-ui/icons'
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
import { AccordionCard } from './AccordionCard'

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
                    {[0, 1, 2].map((i) => (
                      <Radio key={i} value={(i * 50).toString()}>
                        {i}枚
                      </Radio>
                    ))}
                  </HStack>
                </RadioGroup>
              </FormControl>
              <ButtonGroup>
                <Button onClick={onClose}>キャンセル</Button>
                <Button onClick={onConfirm} colorScheme="twitter">
                  決定
                </Button>
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
        <IconButton aria-label="聖晶石を追加" icon={<SmallAddIcon />} />
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
              <Button onClick={onClose}>キャンセル</Button>
              <Button onClick={addSaintQuartz} colorScheme="twitter">
                決定
              </Button>
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
                FGO 石割計算機
              </Heading>
              <ColorModeSwitcher />
            </HStack>
            <Text>目標周回数に達したときの聖晶石所持数とAPを計算します。</Text>
            <AccordionCard>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box>使い方</Box>
                    <AccordionIcon marginLeft="auto" />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <OrderedList spacing={3}>
                    <ListItem>
                      戦利品のスクリーンショットを忘れずに撮影しましょう。
                    </ListItem>
                    <ListItem>
                      計算機に情報を入力します。APの誤差を抑えるため、周回数は100周またはそれ以下を推奨します。
                    </ListItem>
                    <ListItem>
                      目標回数だけ周回したときの聖晶石所持数とAPが出ます。
                    </ListItem>
                    <ListItem>
                      周回を始めます。APは自然回復込みで計算されるので、ある程度周回したらブラウザで再度確認してください。
                    </ListItem>
                    <ListItem>
                      聖晶石召喚を行って聖晶石を消費したときや、絆レベルアップボーナスやログインボーナスで聖晶石を受け取ったときは必ず「周回中の聖晶石増減」に記録してください。記録を忘れるとカウントが破綻します。
                    </ListItem>
                    <ListItem>
                      APが溢れた状態で時間が経つと周回数がずれますのでご注意ください。
                    </ListItem>
                    <ListItem>
                      APが計算結果の範囲内になったら目標達成です。さらに周回する場合は、「周回を継続する」ボタンを押すと入力内容が現在の状態に書き換えられ、続けて周回できるようになります。APは誤差があるので、実際の値に書き換えてください。
                    </ListItem>
                    <ListItem>
                      検証用に累計絆ポイントを使って周回数を確かめることもできます。
                    </ListItem>
                    <ListItem>
                      お疲れさまでした。アイテム獲得数の計算、周回報告には
                      <Link
                        href="https://fgosccalc.max747.org/"
                        isExternal
                        color="blue.500"
                      >
                        fgosccalc
                      </Link>
                      の利用をおすすめします。
                    </ListItem>
                  </OrderedList>
                </AccordionPanel>
              </AccordionItem>
            </AccordionCard>
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
            <AccordionCard>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box>絆カウント</Box>
                    <Badge>任意</Badge>
                    <AccordionIcon marginLeft="auto" />
                  </AccordionButton>
                </h2>
                <AccordionPanel px={5}>
                  <VStack alignItems="stretch">
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
                      </HStack>
                    </FormControl>
                    <QuestBondCalculator setState={setState} />
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </AccordionCard>
            <Card>
              <FormControl id="saint-quartz-addition">
                <FormLabel>周回中の聖晶石増減</FormLabel>
                <Input
                  type="number"
                  name="saintQuartzAddition"
                  value={state.saintQuartzAddition}
                  onChange={handleChange}
                />
                <ButtonGroup marginTop={3} flexWrap="wrap">
                  {[-1, 1, 2, 3].map((value) => (
                    <Button value={value} onClick={addSaintQuartz} key={value}>
                      {value > 0 ? '+' : ''}
                      {value}
                    </Button>
                  ))}
                  <AddSaintQuartzPopover setState={setState} />
                </ButtonGroup>
                <FormHelperText>
                  聖晶石召喚を行ったとき、絆レベルアップ報酬やログインボーナスを受け取ったときは忘れず記録してください。
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
              {!isNaN(finalBond) && finalBond > 0 && (
                <Stat>
                  <StatLabel>累計絆ポイント</StatLabel>
                  <StatNumber>{finalBond}</StatNumber>
                </Stat>
              )}
            </Card>
            <Button onClick={addLap} colorScheme="twitter">
              周回を継続する
            </Button>
            <Button onClick={resetLap}>累計周回数をリセット</Button>
            <Button onClick={resetAll}>入力内容をすべてリセット</Button>
          </VStack>
        </form>
      </Container>
    </ChakraProvider>
  )
}
