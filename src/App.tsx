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
      <Button onClick={onOpen}>?????????????????????????????????????????????</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>????????????????????????????????????</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <FormControl>
                <FormLabel>???????????????????????????</FormLabel>
                <Input
                  type="number"
                  name="questLv"
                  value={localState.questLv}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>???????????????</FormLabel>
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
                <FormLabel>????????????</FormLabel>
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
                        {i}???
                      </Radio>
                    ))}
                  </HStack>
                </RadioGroup>
              </FormControl>
              <ButtonGroup>
                <Button onClick={onClose}>???????????????</Button>
                <Button onClick={onConfirm} colorScheme="twitter">
                  ??????
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
        <IconButton aria-label="??????????????????" icon={<SmallAddIcon />} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>??????????????????</PopoverHeader>
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
              <Button onClick={onClose}>???????????????</Button>
              <Button onClick={addSaintQuartz} colorScheme="twitter">
                ??????
              </Button>
            </ButtonGroup>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const dashForNaN = (value: number) => (isNaN(value) ? '???' : value)

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
      saintQuartzAddition: 0,
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
                FGO ???????????????
              </Heading>
              <ColorModeSwitcher />
            </HStack>
            <Text>?????????????????????????????????????????????????????????AP?????????????????????</Text>
            <AccordionCard>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box>?????????</Box>
                    <AccordionIcon marginLeft="auto" />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <OrderedList spacing={3}>
                    <ListItem>
                      ??????????????????????????????????????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      ???????????????????????????????????????AP??????????????????????????????????????????100?????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      ????????????????????????????????????????????????????????????AP???????????????
                    </ListItem>
                    <ListItem>
                      ????????????????????????AP???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      AP?????????????????????????????????????????????????????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      AP??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????AP????????????????????????????????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      ?????????????????????????????????????????????????????????????????????????????????????????????
                    </ListItem>
                    <ListItem>
                      ??????????????????????????????????????????????????????????????????????????????
                      <Link
                        href="https://fgosccalc.max747.org/"
                        isExternal
                        color="blue.500"
                      >
                        fgosccalc
                      </Link>
                      ????????????????????????????????????
                    </ListItem>
                  </OrderedList>
                </AccordionPanel>
              </AccordionItem>
            </AccordionCard>
            <Card>
              <fieldset>
                <VStack alignItems="stretch">
                  <FormLabel as="legend" fontSize="xl">
                    ????????????????????????
                  </FormLabel>
                  <FormControl id="initial-time">
                    <FormLabel>??????</FormLabel>
                    <InputGroup>
                      <Input
                        type="datetime-local"
                        name="initialTime"
                        value={state.initialTime}
                        onChange={handleChange}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="?????????????????????"
                          icon={<RepeatClockIcon />}
                          onClick={resetTime}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <FormControl id="initial-saint-quartz">
                    <FormLabel>??????????????????</FormLabel>
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
                    ??????????????????
                  </FormLabel>
                  <FormControl id="quest-ap">
                    <FormLabel>??????AP</FormLabel>
                    <Input
                      type="number"
                      name="questAp"
                      value={state.questAp}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl id="quest-lap">
                    <FormLabel>???????????????</FormLabel>
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
                          ?????????????????????????????????????????????????????????????????????????????????100?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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
                    <Box>???????????????</Box>
                    <Badge>??????</Badge>
                    <AccordionIcon marginLeft="auto" />
                  </AccordionButton>
                </h2>
                <AccordionPanel px={5}>
                  <VStack alignItems="stretch">
                    <FormControl>
                      <FormLabel>?????????????????????????????????</FormLabel>
                      <Input
                        type="number"
                        name="initialBond"
                        value={state.initialBond}
                        onChange={handleChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>?????????????????????</FormLabel>
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
                <FormLabel>???????????????????????????</FormLabel>
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
                  ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                </FormHelperText>
              </FormControl>
            </Card>
            <Card>
              <Heading fontSize="xl" fontWeight="medium">
                ????????????
              </Heading>
              <StatGroup>
                <Stat>
                  <StatLabel>???????????????</StatLabel>
                  <StatNumber>
                    {dashForNaN(state.totalQuestLap + state.questLap)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>??????????????????</StatLabel>
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
                  <StatLabel>?????????????????????</StatLabel>
                  <StatNumber>{finalBond}</StatNumber>
                </Stat>
              )}
            </Card>
            <Button onClick={addLap} colorScheme="twitter">
              ?????????????????????
            </Button>
            <Button onClick={resetLap}>??????????????????????????????</Button>
            <Button onClick={resetAll}>????????????????????????????????????</Button>
          </VStack>
        </form>
      </Container>
    </ChakraProvider>
  )
}
