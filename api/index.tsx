import { Button, Frog, TextInput, parseEther, FrameContext } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/vercel'
import { Address } from 'viem';
import { isAddress } from 'web3-validator'
import { Web3 } from 'web3'
import { vars, Image } from './ui.js'
import { getUserInfo, getCoachInfo, getUserRewardInfo, calWidth } from './utils.js'
import { abi } from './abi.js'

const coachTokenAddr = "0x0BC10494bBcfA4FC5B41C54e142026B7B77916C4";
const factoryAddr = "0xCe4e2dc566FFA31108EEe857686FEF4821a8F86C";
const incentiveAddr = "0x53C0dcc1C49650Fd0f5B58B846665C66c1Bf7800";
const defaultFid = '860661'
const homeURL = 'web3-coach-mvp'

const web3 = new Web3('https://polygon.llamarpc.com');
// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

type State = {
    coachAddr: string,
    coachName: string,
    coachDesc: string,
    ownerFid: string,
    ownerName: string,
    ownerPFPURL: string,
    coachAmount: string,
    supervisors: string,
    donors: string,
    checkInNum: string,
    donateAmount: string,
    starttime: string,
    lastCheckInTime: string,

    // Transaction Params
    checkInURL: string,
    donateMemo: string,
    newCoachName: string,
    newCoachDesc: string,
    newCoachAddress: string,
    newOwnerName: string,
    newOwnerPFPURL: string,
    newOwnerFid: string,
    newCoachAmount: string,
    claimCoaches: `0x${string}`[],
    claimAmount: string,

    pendingTXHash: string,
    checkInTXHash: string,
    approveTXHash: string,
    createCoachTXHash: string,
    claimTXHash: string
}

export const app = new Frog<{ State: State }>({
    ui: { vars },
    title: "Web3Coach",
    assetsPath: '/',
    basePath: '/api',
    initialState: {
        coachAddr: '',
        coachName: '',
        coachDesc: '',
        ownerFid: '',
        ownerName: '',
        ownerPFPURL: '',
        coachAmount: '',
        supervisors: '',
        donors: '',
        checkInNum: '',
        donateAmount: '',
        starttime: '',
        lastCheckInTime: '',

        checkInURL: '',
        donateMemo: '',
        newCoachName: '',
        newCoachDesc: '',
        newCoachAddress: '',
        newOwnerName: '',
        newOwnerPFPURL: '',
        newOwnerFid: '',
        newCoachAmount: '',
        claimCoaches: [],
        claimAmount: '',
        pendingTXHash: '',
        approveTXHash: '',
        checkInTXHash: '',
        createCoachTXHash: '',
        claimTXHash: ''
    }
    // Supply a Hub to enable frame verification.
    // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/:coachId', async (c) => {
    const coachId = c.req.param("coachId")
    const { deriveState } = c
    let isValidCoach = isAddress(coachId)
    let response: any
    let coachInfo: any
    let wp = ''
    
    if (isValidCoach) {
        try {
            coachInfo = await getCoachInfo(coachId)
            response = await getUserInfo(coachInfo?.ownerFid ?? defaultFid)

            if (coachInfo) {
                deriveState(previousState => {
                    previousState.coachAddr = coachId
                    previousState.coachName = coachInfo?.name ?? ""
                    previousState.coachDesc = coachInfo?.desc ?? ""
                    previousState.ownerFid = coachInfo?.ownerFid ?? ""
                    previousState.ownerName = response.display_name
                    previousState.ownerPFPURL = response.pfp_url
                    previousState.coachAmount = (parseFloat(coachInfo?.coachAmount) / 1e18).toString() ?? ""
                    previousState.checkInNum = coachInfo?.checkInNum ?? ""
                    previousState.supervisors = coachInfo?.superviors ?? ""
                    previousState.donors = coachInfo?.donors ?? ""
                    previousState.donateAmount = coachInfo?.donateAmount ?? ""
                    previousState.starttime = coachInfo?.starttime ?? ""
                    previousState.lastCheckInTime = coachInfo?.lastCheckInTime ?? ""
                    wp = calWidth(previousState.checkInNum)
                })

            } else {
                isValidCoach = false
            }

        } catch (error) {
            console.error(error)
            isValidCoach = false
        }
    }

    return c.res({
        image: (
            isValidCoach ?
                <div tw="flex flex-col items-center w-full h-full text-white">
                    <img
                        style={{ objectFit: "cover" }}
                        tw="absolute inset-0"
                        src="/bg_base.png"
                    />
                    <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                        <div tw="flex flex-col items-center w-1/4">
                            <Image
                                borderRadius="64"
                                height="128"
                                src={response.pfp_url}
                            />
                            <div tw="my-3">
                                {response.display_name}
                            </div>
                        </div>
                        <div tw="flex flex-col w-3/4 pl-12">
                            <div tw="flex text-gray-100">
                                Habit Name:
                            </div>
                            <div tw="flex justify-end mb-4">
                                {coachInfo.name}
                            </div>
                            <div tw="flex text-gray-100">
                                Locked Value:
                            </div>
                            <div tw="flex justify-end">
                                {(parseFloat(coachInfo?.coachAmount) / 1e18).toString()} $MATIC
                            </div>
                            {/* <div tw="flex text-gray-100">
                                Desc:
                            </div>
                            <div tw="flex justify-end pl-16 text-right">
                                {coachInfo?.desc}
                            </div> */}
                        </div>
                    </div>
                    <div tw="flex flex-col items-center p-5 bg-purple-900">
                        <div tw="flex">
                            Current Check-In Num: {coachInfo.checkInNum}
                        </div>
                        <div tw="flex justify-between w-full items-center">
                            <div tw="flex w-3/4 bg-gray-200 rounded-lg h-5 m-5">
                                <div tw={`flex bg-blue-600 rounded-lg ${wp}`}></div>
                            </div>
                            <div tw="flex w-1/4">
                                21 Check-In
                            </div>
                        </div>
                    </div>

                    <div tw="flex justify-between w-full items-center h-45 p-2">
                        <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                            <div tw="flex">
                                Total Supervisors:    {coachInfo.superviors}
                            </div>
                            <div tw="flex py-3 text-yellow-300">
                                {coachInfo.superviors} PC Rewards/Supervisor
                            </div>
                        </div>
                        <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                            <div tw="flex">
                                Total Donors:    {coachInfo.donors}
                            </div>
                            <div tw="flex py-3 text-yellow-300">
                                {(parseFloat(coachInfo.donors) * 100).toString()} PC Rewards/Donor
                            </div>
                        </div>
                    </div>
                </div> :
                <div tw="flex flex-col items-center w-full h-full text-white">
                    <img
                        style={{ objectFit: "cover" }}
                        tw="absolute inset-0"
                        src="/bg_base.png"
                    />
                    <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                        <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl">
                            Not Valid Coach Address
                        </div>
                    </div>
                </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            // <TextInput placeholder="Enter custom fruit..1." />,
            <Button action={`/${coachId}/checkIn`}>Check-In</Button>,
            <Button action={`/${coachId}/supervise_donate`}>Supervise/Donate</Button>,
            <Button action={`/${coachId}/create`}>Create New Coach</Button>,
            <Button action={`/${coachId}/stats`}>Your Stats</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/checkIn', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState, previousState } = c
    const state = deriveState()
    // console.log(previousState)
    // console.log(state)
    let lastCheckInTime = new Date(parseInt(state.lastCheckInTime) * 1000).toLocaleString()
    let nextCheckInTime = new Date((parseInt(state.lastCheckInTime) + 24 * 3600) * 1000).toLocaleString()
    let wp = calWidth(previousState.checkInNum)

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_check.png"
                />

                <div tw="flex flex-col items-center px-10 mt-29">
                    <div tw="flex text-xl">
                        Current Check-In Num: {state.checkInNum}
                    </div>
                    <div tw="flex justify-between w-full items-center">
                        <div tw="flex w-3/4 bg-gray-200 rounded-lg h-5 m-5">
                            <div tw={`flex bg-blue-600 rounded-lg ${wp}`}></div>
                        </div>
                        <div tw="flex w-1/4">
                            21 Check-In
                        </div>
                    </div>
                </div>

                <div tw="flex flex-col items-end w-full text-right pr-12 pt-5 text-yellow-300">
                    <div tw="flex">
                        {lastCheckInTime}
                    </div>
                    <div tw="flex pt-3">
                        {nextCheckInTime}
                    </div>
                    <div tw="flex pt-4">
                        {(parseFloat(state.coachAmount) / 21).toString()} $MATIC
                    </div>
                    <div tw="flex pt-4">
                        {(parseFloat(state.donateAmount) / 1e18).toString()} $COACH
                    </div>
                </div>
                <div tw="flex w-4/5 p-4 rounded-lg bg-gray-900 text-yellow-300 text-center mt-20">
                    In addition to taking your tokens and accumulated donations, enter a Check-In Cast link to show everyone and prove your progress.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <TextInput placeholder="https://warpcast.com/..." />,
            <Button.Transaction target="/checkIn/sendTX" action={`/${coachId}/checkIn/complete`}>Check-In</Button.Transaction>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/checkIn/complete', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState, transactionId } = c
    const state = deriveState((previousState) => {
        if (transactionId) {
            previousState.checkInNum = transactionId
        }
    })


    let isPending = true

    try {
        const txLog = await web3.eth.getTransactionReceipt(state.checkInNum as Address)

        // const txResult = web3.eth.abi.decodeLog([
        //     {
        //       "indexed": true,
        //       "internalType": "address",
        //       "name": "from",
        //       "type": "address"
        //     },
        //     {
        //       "indexed": true,
        //       "internalType": "address",
        //       "name": "to",
        //       "type": "address"
        //     },
        //     {
        //       "indexed": false,
        //       "internalType": "uint256",
        //       "name": "value",
        //       "type": "uint256"
        //     }
        //   ], txLog.logs[-1].data ?? "", txLog.logs[-1].topics ?? [])

        isPending = false
    } catch (error) {
        console.log("tx pending")
        console.log(error)
    }
    

    return c.res({
        image: (
            !isPending ? <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl">
                        Congratulations, you successfully completed a check-in
                    </div>
                </div>
            </div> : <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl">
                        Click Check TX Status Button to get transaction status.
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            !isPending && <Button action={`/${coachId}/supervise_donate`}>Supervise/Donate</Button>,
            !isPending && <Button action={`/${coachId}/create`}>Create New Coach</Button>,
            isPending && <Button action={`/${coachId}/checkIn/complete`}>Check TX Status</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/supervise_donate', async (c) => {
    const coachId = c.req.param('coachId')

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-22">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900">
                        <div tw="text-yellow-300 text-xl">
                            For Supervisor:
                        </div>
                        <div tw="py-3">
                            If you are interested in someone's training, become his supervisor and supervise his check-in cast in farcaster. And when the training is completed, you can get PC Token rewards. Each additional supervisor increases the reward by +1 PC. These rewards will be distributed to users after the 21st check-in, and users need to claim them.
                        </div>
                    </div>
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900">
                        <div tw="text-yellow-300 text-xl">
                            For Donor:
                        </div>
                        <div tw="py-3">
                            If you recognize someone’s training progress, please donate. For each new donor, 10 PC Rewards will be added to each donor. These rewards will be distributed after the user completes the 21st Check-In. These donations will be collected at his next check-in.
                        </div>
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <Button action={`/${coachId}/supervise`}>Supervise</Button>,
            <Button action={`/${coachId}/donate`}>Donate</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/supervise', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState } = c
    const state = deriveState()

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={state.ownerPFPURL}
                        />
                        <div tw="my-3">
                            {state.ownerName}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.coachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.coachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {coachInfo?.desc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900 border-4 border-purple-600">
                    <div tw="flex">
                        Total Supervisers:    {state.supervisors}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {state.supervisors} PC Rewards/Superviser
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-12 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Click Supervise Button to send the transaction.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            // <TextInput placeholder="Enter custom fruit..1." />,
            <Button.Transaction target="/supervise/sendTX" action={`/${coachId}/supervise/complete`}>Supervise</Button.Transaction>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/supervise/complete', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState, transactionId } = c
    const state = deriveState((previousState) => {
        if (transactionId) {
            previousState.pendingTXHash = transactionId
        }
    })

    let isPending = true;
    try {
        const txLog = await web3.eth.getTransactionReceipt(state.pendingTXHash as Address)
        const txResult = web3.eth.abi.decodeLog([
            {
              "indexed": false,
              "internalType": "address",
              "name": "supervisor",
              "type": "address"
            }
        ], txLog.logs[0].data ?? "", txLog.logs[0].topics ?? [])
        
        isPending = false

    } catch (error) {
        console.log("tx pending")
    }
    
    return c.res({
        image: (
            !isPending ? <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={state.ownerPFPURL}
                        />
                        <div tw="my-3">
                            {state.ownerName}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.coachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.coachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {coachInfo?.desc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900 border-4 border-purple-600">
                    <div tw="flex">
                        Total Supervisers:    {state.supervisors}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {state.supervisors} PC Rewards/Superviser
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-12 p-4 text-center rounded-lg bg-gray-900 text-yellow-300 border-4 border-lime-600">
                    Congratulations, you have became this coach's superviser. After he completes training, you can get PC rewards.
                </div>
            </div> : <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl text-center">
                        This transaction is still pending, please click the Check TX Status button to refresh. 
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            !isPending && <Button action={`/${coachId}/create`}>Create New Coach</Button>,
            !isPending && <Button action={`/${coachId}/stats`}>Your Stats</Button>,
            isPending && <Button action={`/${coachId}/supervise/complete`}>Check TX Status</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/donate', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState } = c
    const state = deriveState()

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={state.ownerPFPURL}
                        />
                        <div tw="my-3">
                            {state.ownerName}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.coachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.coachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {coachInfo?.desc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900 border-4 border-purple-600">
                    <div tw="flex">
                        Total Donors:    {state.donors}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {parseInt(state.donors) * 10} PC Rewards/Donor
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-12 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Selected The Donated Token.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            // <TextInput placeholder="Enter custom fruit..1." />,
            <Button action={`/${coachId}/donate/inputMemo`} value="COACH">$COACH</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/donate/inputMemo', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState } = c
    const state = deriveState()

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={state.ownerPFPURL}
                        />
                        <div tw="my-3">
                            {state.ownerName}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.coachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.coachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {coachInfo?.desc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900 border-4 border-purple-600">
                    <div tw="flex">
                        Total Donors:    {state.donors}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {parseInt(state.donors) * 10} PC Rewards/Donor
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-12 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Input Donate Memo and click Next Step Button to send transaction.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <TextInput placeholder="Input Donate Memo..." />,
            <Button action={`/${coachId}/donate/selectedToken`}>➡️ Next Step</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/donate/selectedToken', async (c) => {
    const coachId = c.req.param('coachId')
    const { inputText, deriveState } = c

    const state = deriveState(previousState => {
        previousState.donateMemo = inputText ?? ""
    })

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={state.ownerPFPURL}
                        />
                        <div tw="my-3">
                            {state.ownerName}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.coachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.coachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {coachInfo?.desc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900 border-4 border-purple-600">
                    <div tw="flex">
                        Total Donors:    {state.donors}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {parseInt(state.donors) * 10} PC Rewards/Donor
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-12 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Input Donate Amount and click Donate Button to complete this spend.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <TextInput placeholder="Input Donate Amount..." />,
            <Button.Transaction target="/donate/sendTX" action={`/${coachId}/donate/complete`}>Donate</Button.Transaction>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/donate/complete', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState, transactionId } = c
    const state = deriveState((previousState) => {
        if (transactionId) {
            previousState.pendingTXHash = transactionId
        }
    })

    let isPending = true;
    try {
        const txLog = await web3.eth.getTransactionReceipt(state.pendingTXHash as Address)

        // const txResult = web3.eth.abi.decodeLog([
        //     {
        //         "indexed": false,
        //         "internalType": "address",
        //         "name": "donor",
        //         "type": "address"
        //     },
        //     {
        //         "indexed": false,
        //         "internalType": "contract IERC20",
        //         "name": "donateToken",
        //         "type": "address"
        //     },
        //     {
        //         "indexed": false,
        //         "internalType": "uint256",
        //         "name": "donateAmount",
        //         "type": "uint256"
        //     },
        //     {
        //         "indexed": false,
        //         "internalType": "string",
        //         "name": "memo",
        //         "type": "string"
        //     }
        // ], txLog.logs[1].data ?? "", txLog.logs[1].topics ?? [])
        
        isPending = false

    } catch (error) {
        console.log("tx pending")
        console.log(error)
    }
    

    return c.res({
        image: (
            !isPending ? 
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={state.ownerPFPURL}
                        />
                        <div tw="my-3">
                            {state.ownerName}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.coachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.coachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {coachInfo?.desc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900 border-4 border-purple-600">
                    <div tw="flex">
                        Total Donors:    {state.donors}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {parseInt(state.donors) * 10} PC Rewards/Donor
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-12 p-4 text-center rounded-lg bg-gray-900 text-yellow-300 border-4 border-lime-600">
                    Congratulations, you have became this coach's donor. After he completes training, you can get PC rewards.
                </div>
            </div> : <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl text-center">
                        This transaction is still pending, please click the Check TX Status button to refresh. 
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            !isPending && <Button action={`/${coachId}/create`}>Create New Coach</Button>,
            !isPending && <Button action={`/${coachId}/stats`}>Your Stats</Button>,
            isPending && <Button action={`/${coachId}/donate/complete`}>Check TX Status</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // <Button.Link href="https://t.me/HelloPay_Official">Create New Coach</Button.Link>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/create', async (c) => {
    const coachId = c.req.param('coachId')

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900">
                        <div tw="text-yellow-300 text-xl">
                            For Creator:
                        </div>
                        <div tw="py-3">
                            Lock your cryptocurrencies into your exclusive CoachVault, and you can withdraw them in batches via Check-In, 2.38% each time, until the 21st time to withdraw all the rest together. The minimum time interval between two Check-Ins is 1 day. Get your crypto back and develop a good habit.
                        </div>
                        <div tw="py-3">
                            Of course, in addition to these, you will receive 1000+ PC Token rewards after completing training. The more supervisors and the more donors, the rewards available will be significantly increased. Please check the documentation for details.
                        </div>
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <Button action={`/${coachId}/create/step1`}>➡️ Next Step</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/create/step1', async (c) => {
    const coachId = c.req.param('coachId')

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />

                <div tw="flex flex-col justify-center items-center w-full mt-20 py-5 text-xl">
                    <div tw="flex p-2 rounded-full border-4 border-solid border-violet-700">
                        Step1: Input the trained habit name.
                    </div>
                    <div tw="flex p-2" >
                        Step2: Input the desc.
                    </div>
                    <div tw="flex p-2">
                        Step3: Input the locked $MATIC amount you want.
                    </div>
                    <div tw="flex p-2">
                        Step4: Create Your Web3Coach.
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-7 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Input the trained habit name and click the Next Button.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <TextInput placeholder="Input the trained habit name..." />,
            <Button action={`/${coachId}/create/step2`}>➡️ Next Step</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/create/step2', async (c) => {
    const coachId = c.req.param('coachId')
    const { inputText, deriveState } = c

    deriveState(previousState => {
        previousState.newCoachName = inputText ?? ""
    })

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />

                <div tw="flex flex-col justify-center items-center w-full mt-20 py-5 text-xl">
                    <div tw="flex p-2">
                        Step1: Input the trained habit name.
                    </div>
                    <div tw="flex p-2 rounded-full border-4 border-solid border-violet-700" >
                        Step2: Input the desc.
                    </div>
                    <div tw="flex p-2">
                        Step3: Input the locked $MATIC amount you want.
                    </div>
                    <div tw="flex p-2">
                        Step4: Create Your Web3Coach.
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-7 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Input the desc and click the Next Button.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <TextInput placeholder="Input the desc..." />,
            <Button action={`/${coachId}/create/step3`}>➡️ Next Step</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/create/step3', async (c) => {
    const coachId = c.req.param('coachId')
    const { inputText, deriveState } = c
    deriveState(previousState => {
        previousState.newCoachDesc = inputText ?? ""
    })

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />

                <div tw="flex flex-col justify-center items-center w-full mt-20 py-5 text-xl">
                    <div tw="flex p-2">
                        Step1: Input the trained habit name.
                    </div>
                    <div tw="flex p-2" >
                        Step2: Input the desc.
                    </div>
                    <div tw="flex p-2 rounded-full border-4 border-solid border-violet-700">
                        Step3: Input the locked $MATIC amount you want.
                    </div>
                    <div tw="flex p-2">
                        Step4: Create Your Web3Coach.
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-7 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Input the locked $MATIC amount you want and click the Next Step Button.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <TextInput placeholder="Input $MATIC amount..." />,
            <Button action={`/${coachId}/create/step4`}>➡️ Next Step</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/create/step4', async (c) => {
    const coachId = c.req.param('coachId')
    const { inputText, deriveState, frameData } = c
    const state = deriveState((previousState) => {
        previousState.newCoachAmount = inputText ?? ""
        previousState.newOwnerFid = frameData?.fid.toString() ?? ""
    })

    return c.res({
        image: (
            <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />

                <div tw="flex flex-col justify-center items-center w-full mt-20 py-5 text-xl">
                    <div tw="flex p-2">
                        Step1: Input the trained habit name.
                    </div>
                    <div tw="flex p-2" >
                        Step2: Input the desc.
                    </div>
                    <div tw="flex p-2">
                        Step3: Input the locked $MATIC amount you want.
                    </div>
                    <div tw="flex p-2 rounded-full border-4 border-solid border-violet-700">
                        Step4: Create Your Web3Coach.
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-7 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Click the Create Button to complete the create progress.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            <Button.Transaction target="/create/sendTX" action={`/${coachId}/create/complete`}>Create New Coach</Button.Transaction>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/create/complete', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState, transactionId, frameData } = c
    let state = deriveState((previousState) => {
        if (transactionId) {
            previousState.createCoachTXHash = transactionId
        }
    })

    console.log(frameData)

    let coachAddr: string = '';
    let response = await getUserInfo(state.newOwnerFid)
    let isPending = true;

    try {
        const txLog = await web3.eth.getTransactionReceipt(state.createCoachTXHash as Address)

        const txResult = web3.eth.abi.decodeLog([
            {
              "indexed": false,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "ownerFid",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "coach",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalCoachFund",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "trainingName",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "trainingDesc",
              "type": "string"
            }
        ], txLog.logs[1].data ?? "", txLog.logs[1].topics ?? [])


        deriveState((previousState) => {
            previousState.newCoachAddress = txResult.coach as string
        })
        coachAddr = txResult.coach as string
        isPending = false
    } catch (error) {
        console.log("tx pending")
        console.log(error)
    }

    return c.res({
        image: (
            !isPending ? <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-60 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={response.pfp_url}
                        />
                        <div tw="my-3">
                            {response.display_name}
                        </div>
                    </div>
                    <div tw="flex flex-col w-3/4 pl-12">
                        <div tw="flex text-gray-100">
                            Habit Name:
                        </div>
                        <div tw="flex justify-end mb-4">
                            {state.newCoachName}
                        </div>
                        <div tw="flex text-gray-100">
                            Locked Value:
                        </div>
                        <div tw="flex justify-end">
                            {state.newCoachAmount} $MATIC
                        </div>
                        {/* <div tw="flex text-gray-100">
                            Desc:
                        </div>
                        <div tw="flex justify-end pl-16 text-right">
                            {state.newCoachDesc}
                        </div> */}
                    </div>
                </div>
                <div tw="flex flex-col items-center p-5 bg-purple-900">
                    <div>
                        Current Check-In Num: 0
                    </div>
                    <div tw="flex justify-between w-full items-center">
                        <div tw="flex w-3/4 bg-gray-200 rounded-lg h-5 m-5">
                            <div tw="flex bg-blue-600 rounded-lg"></div>
                        </div>
                        <div tw="flex w-1/4">
                            21 Check-In
                        </div>
                    </div>
                </div>

                <div tw="flex justify-between w-full items-center h-45 p-2">
                    <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                        <div>
                            Total Supervisors:    0
                        </div>
                        <div tw="py-3 text-yellow-300">
                            0 PC Rewards/Supervisor
                        </div>
                    </div>
                    <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                        <div>
                            Total Donors:    0
                        </div>
                        <div tw="py-3 text-yellow-300">
                            0 PC Rewards/Donor
                        </div>
                    </div>
                </div>
            </div> : <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />

                <div tw="flex flex-col justify-center items-center w-full mt-20 py-5 text-xl">
                    <div tw="flex p-2">
                        Step1: Input the trained habit name.
                    </div>
                    <div tw="flex p-2" >
                        Step2: Input the desc.
                    </div>
                    <div tw="flex p-2">
                        Step3: Input the locked $MATIC amount you want.
                    </div>
                    <div tw="flex p-2 rounded-full border-4 border-solid border-violet-700">
                        Step4: Create Your Web3Coach.
                    </div>
                </div>
                <div tw="flex flex-col w-11/12 mt-7 p-4 items-center rounded-lg bg-gray-900 text-yellow-300">
                    Click the Check TX Status Button to continue.
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            !isPending && <Button.Link href={`https://warpcast.com/~/compose?text=I%20just%20created%20a%20Web3Coach%20to%20train%20good%20habits.%20Please%20supervise%20the%20training%20or%20donate%20to%20me.%20In%20addition,%20you%20can%20also%20get%20COACH%20rewards.%F0%9F%9A%80%20&embeds%5B%5D=https://${homeURL}/api/${coachAddr}`}>
                Share Your New Coach
            </Button.Link>,
            isPending && <Button action={`/${coachId}/create/complete`}>Check TX Status</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/stats', async (c) => {
    const coachId = c.req.param('coachId')
    const { frameData, deriveState } = c

    let isPending = true
    let claimable = false
    let response
    let statusResult: any
    try {
        response = await getUserInfo(frameData?.fid.toString() ?? defaultFid)
        statusResult = await getUserRewardInfo(frameData?.fid.toString() ?? defaultFid)
        
        if (statusResult.claimableRewards > 0) {
            claimable = true
            deriveState((previousState) => {
                previousState.claimCoaches = statusResult.claimableCoaches
                previousState.claimAmount = statusResult.claimableRewards
            })
        }
        
        isPending = false
    } catch (error) {
        console.log(error)
    }

    return c.res({
        image: (
            !isPending ? <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_stats.png"
                />
                <div tw="flex text-lg p-10 mt-13 h-55 text-yellow-300">
                    <div tw="flex flex-col items-center w-1/4">
                        <Image
                            borderRadius="64"
                            height="128"
                            src={response.pfp_url}
                        />
                        <div tw="my-3">
                            {response.display_name}
                        </div>
                    </div>
                    <div tw="flex flex-col items-end w-3/4 text-right mt-5">
                        <div tw="flex">
                            {statusResult.claimableRewards.toFixed(4).toString()} $COACH
                        </div>
                        <div tw="flex mt-6">
                            {statusResult.pendingRewards.totalPendingRewards.toFixed(4).toString()} $COACH
                        </div>
                    </div>
                </div>
                <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                    <div tw="flex">
                        Your Coaches:    {statusResult.pendingRewards.ownerCoachNum.toString()}
                    </div>
                    <div tw="flex py-3 text-yellow-300">
                        {statusResult.pendingRewards.ownerRewards.toFixed(4).toString()} Pending $COACH
                    </div>
                </div>

                <div tw="flex justify-between w-full items-center p-2">
                    <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                        <div tw="flex">
                            Your Supervised Coaches:    {statusResult.pendingRewards.supervCoachNum.toString()}
                        </div>
                        <div tw="flex py-3 text-yellow-300">
                            {statusResult.pendingRewards.superviseRewards.toFixed(4).toString()} Pending $COACH
                        </div>
                    </div>
                    <div tw="flex flex-col w-72 py-4 items-center rounded-lg bg-gray-900">
                        <div tw="flex">
                            Total Donated Coaches:    {statusResult.pendingRewards.donateCoachNum.toString()}
                        </div>
                        <div tw="flex py-3 text-yellow-300">
                            {statusResult.pendingRewards.donateRewards.toFixed(4).toString()} Pending $COACH
                        </div>
                    </div>
                </div>
                <div tw="flex items-center text-yellow-300 mt-5">
                    Create/Supervise/Donate More Coaches to get more $COACH Rewards.
                </div>
            </div> : <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl">
                        Click Refresh Button to refresh the result.
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            !isPending && claimable && <Button.Transaction target="/stats/sendTX" action='/donate/complete'>Claim Pending Rewards</Button.Transaction>,
            !isPending && <Button action={`/${coachId}/supervise_donate`}>Supervise/Donate</Button>,
            !isPending && <Button action={`/${coachId}/create`}>Create New Coach</Button>,
            isPending && <Button action={`/${coachId}/stats`}>Refresh</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/:coachId/stats/complete', async (c) => {
    const coachId = c.req.param('coachId')
    const { deriveState, transactionId } = c
    const state = deriveState((previousState) => {
        if (transactionId) {
            previousState.claimTXHash = transactionId
        }
    })


    let isPending = true

    try {
        const txLog = await web3.eth.getTransactionReceipt(state.claimTXHash as Address)

        // const txResult = web3.eth.abi.decodeLog([
        //     {
        //       "indexed": true,
        //       "internalType": "address",
        //       "name": "from",
        //       "type": "address"
        //     },
        //     {
        //       "indexed": true,
        //       "internalType": "address",
        //       "name": "to",
        //       "type": "address"
        //     },
        //     {
        //       "indexed": false,
        //       "internalType": "uint256",
        //       "name": "value",
        //       "type": "uint256"
        //     }
        //   ], txLog.logs[-1].data ?? "", txLog.logs[-1].topics ?? [])

        isPending = false
    } catch (error) {
        console.log("tx pending")
        console.log(error)
    }
    

    return c.res({
        image: (
            !isPending ? <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl">
                        Congratulations, you successfully claimed {parseFloat(state.claimAmount).toFixed(4).toString()} $COACH Rewards🚀.
                    </div>
                </div>
            </div> : <div tw="flex flex-col items-center w-full h-full text-white">
                <img
                    style={{ objectFit: "cover" }}
                    tw="absolute inset-0"
                    src="/bg_base.png"
                />
                <div tw="flex flex-col justify-center w-full items-center p-2 mt-40">
                    <div tw="flex flex-col w-11/12 p-4 m-2 items-center rounded-lg bg-gray-900 text-yellow-300 text-xl">
                        Click Check TX Status Button to get transaction status.
                    </div>
                </div>
            </div>
        ),
        imageAspectRatio: "1:1",
        imageOptions: {
            width: 600,
            height: 600
        },
        intents: [
            !isPending && <Button action={`/${coachId}/supervise_donate`}>Supervise/Donate</Button>,
            !isPending && <Button action={`/${coachId}/create`}>Create New Coach</Button>,
            isPending && <Button action={`/${coachId}/stats/complete`}>Check TX Status</Button>,
            <Button action={`/${coachId}`}>⬅️ Back</Button>,
            // status === 'response' && <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.transaction('/donate/approve', (c) => {
    const { inputText, previousState } = c

    // Contract transaction response.
    const approveAmount = parseEther(inputText ?? "0");
    console.log(previousState);

    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'approve',
        args: [previousState.coachAddr as Address, approveAmount],
        to: coachTokenAddr,
    })
})

app.transaction('/donate/sendTX', (c) => {
    const { inputText, previousState, frameData } = c

    // Contract transaction response.
    const donateAmount = parseEther(inputText ?? "0");
    console.log(donateAmount, previousState.donateMemo)

    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'donate',
        args: [coachTokenAddr, donateAmount, BigInt(frameData?.fid ?? defaultFid), previousState.donateMemo],
        to: previousState.coachAddr as Address,
    })
})

app.transaction('/supervise/sendTX', (c) => {
    const { previousState, frameData } = c

    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'supervise',
        args: [BigInt(frameData?.fid ?? defaultFid)],
        to: previousState.coachAddr as Address,
    })
})

app.transaction('/checkIn/sendTX', (c) => {
    const { inputText, previousState } = c
    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'checkIn',
        args: ["", inputText ?? ""],
        to: previousState.coachAddr as Address,
    })
})

app.transaction('/create/approve', (c) => {
    const { previousState } = c

    // Contract transaction response.
    const approveAmount = parseEther(previousState.newCoachAmount ?? "0");
    console.log(previousState);

    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'approve',
        args: [previousState.coachAddr as Address, approveAmount],
        to: previousState.coachAddr as Address,
    })
})

app.transaction('/create/sendTX', (c) => {
    const { previousState } = c
    const coachAmount = parseEther(previousState.newCoachAmount ?? "0");
    const fid = (previousState.newOwnerFid ?? '0')

    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'createNewCoach',
        args: [BigInt(fid), previousState.newCoachName ?? "", previousState.newCoachDesc ?? ""],
        to: factoryAddr,
        value: coachAmount
    })
})

app.transaction('/stats/sendTX', (c) => {
    const { previousState, frameData } = c

    return c.contract({
        abi,
        chainId: 'eip155:137',
        functionName: 'claim',
        args: [BigInt(frameData?.fid ?? defaultFid), previousState.claimCoaches],
        to: incentiveAddr,
    })
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
