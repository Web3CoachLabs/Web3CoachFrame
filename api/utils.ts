import axios from "axios";
import { Address } from 'viem';

const thegraph_api = "https://api.studio.thegraph.com/query/63989/polycoachpolygon/version/latest"
const PINNATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjZTk5MDEzNy1lN2E5LTQwMGEtOTE1MS04MWNiNDMwMDc3YzciLCJlbWFpbCI6ImpheXNvbmRlZmluZXJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjBjZjNlODYxY2UwNjVjN2RiNTBlIiwic2NvcGVkS2V5U2VjcmV0IjoiMjkwYjM5N2FjNmI0NGNhODhlN2I0MGYwMmYyZTdhNDhhOTYxMDljMzUzYmQ0N2FhZWUzOWFlMzRkZDBjZmMzYyIsImlhdCI6MTcxNTA2MzMwMX0.tf6xqo9JhVLb8KlVt2vJx4YodrJ6oFfqdY5cvShGaeM"
// const KEY = "0cf3e861ce065c7db50e"
const options = { headers: { Authorization: `Bearer ${PINNATA_JWT}`, "Content-Type": "application/json" } };

interface CoachInfo { 
    coach: {
        id: string,
        owner: string,
        name: string,
        desc: string,
        ownerFid: string,
        checkInNum: string,
        coachAmount: string,
        donateAmount: string,
        superviors: string,
        donors: string,
        starttime: string,
        lastCheckInTime: string
    }
}

interface  CoachBaseInfo {
  id: string,
  checkInNum: string,
  donors: string,
  superviors: string
}

interface UserInfo { 
  user: {
      id: string,
      claimedAmount: string,
      claimedCoaches: string[],
      ownedCoaches: CoachBaseInfo[],
      donatedCoaches: CoachBaseInfo[],
      supervisedCoaches: CoachBaseInfo[]
  }
}

export async function getUserInfo(fid: string) {
    let response = await axios.get(`https://api.pinata.cloud/v3/farcaster/users/${fid}`, options)

    // let response2 = await axios.get('https://i.seadn.io/gae/lhGgt7yK1JiBVYz_HBxcAmYLRtP03aw5xKX4FgmFT9Ai7kLD5egzlLvb0lkuRNl28shtjr07DC8IHzLUkTqlWUMndUzC9R5_MSxH3g?w=500&auto=format')


    // let x = encodeURIComponent('https://i.seadn.io/gae/lhGgt7yK1JiBVYz_HBxcAmYLRtP03aw5xKX4FgmFT9Ai7kLD5egzlLvb0lkuRNl28shtjr07DC8IHzLUkTqlWUMndUzC9R5_MSxH3g?w=500&auto=format')

    // console.log(x)
    return response.data.user
}

export async function getCoachInfo(address: string) {
    const query = `
        query($address:ID){
            coach(id:$address){
                id
                owner
                name
                desc
                ownerFid
                checkInNum
                coachAmount
                donateAmount
                superviors
                donors
                starttime
                lastCheckInTime
            }
        }
    `;
    const variables = {
      address
    }
    
    const res = await queryGraphql<CoachInfo>(thegraph_api, query, variables);
    return res.data?.coach
}

export async function getUserRewardInfo(fid: string) {
  const query = `
  query($fid:ID){
      user(id:$fid){
          id
          claimedAmount
          claimedCoaches
          ownedCoaches {
            id
            checkInNum
            donors
            superviors
          }
          donatedCoaches {
            id
            checkInNum
            donors
            superviors
          }
          supervisedCoaches {
            id
            checkInNum
            donors
            superviors
          }
      }
    }
  `;
  const variables = {
    fid
  }

  const res = await queryGraphql<UserInfo>(thegraph_api, query, variables);
  let result = res.data?.user
  const checkInCompletedNum = 2

  let claimableRewards = 0
  let pendingRewards = {
    totalPendingRewards: 0,
    ownerRewards: 0,
    donateRewards: 0,
    superviseRewards: 0,
    ownerCoachNum: result?.ownedCoaches.length ?? 0,
    donateCoachNum: result?.donatedCoaches.length ?? 0,
    supervCoachNum: result?.supervisedCoaches.length ?? 0
  }

  let claimableCoaches: string[] = []
  
  let claimedCoaches = result?.claimedCoaches ?? []

  result?.ownedCoaches.forEach(function(val, index) {
      let pendingReward = (parseInt(val.donors) * 10 + parseInt(val.superviors)) / 10 + 1000
      
      if (parseInt(val.checkInNum) == checkInCompletedNum && claimedCoaches.indexOf(val.id) == -1) {
        claimableCoaches.push(val.id as Address)
        claimableRewards + pendingReward
      } else {
        pendingRewards.totalPendingRewards += pendingReward
        pendingRewards.ownerRewards += pendingReward
      }
    }
  )

  result?.donatedCoaches.forEach(function(val, index) {
      let pendingReward = parseInt(val.donors) * 10
      
      if (parseInt(val.checkInNum) == checkInCompletedNum && claimedCoaches.indexOf(val.id) == -1) {
        claimableCoaches.push(val.id)
        claimableRewards + pendingReward
      } else {
        pendingRewards.totalPendingRewards += pendingReward
        pendingRewards.donateRewards += pendingReward
      }
    }
  )

  result?.supervisedCoaches.forEach(function(val, index) {
      let pendingReward = parseInt(val.donors)
      
      if (parseInt(val.checkInNum) == checkInCompletedNum && claimedCoaches.indexOf(val.id) == -1) {
        claimableCoaches.push(val.id)
        claimableRewards + pendingReward
      } else {
        pendingRewards.totalPendingRewards += pendingReward
        pendingRewards.superviseRewards += pendingReward
      }
    }
  )

  return {
    claimableRewards,
    claimableCoaches,
    pendingRewards,
  }
}

export function calWidth(checkInNum: string): string {
  let widthP = parseFloat(checkInNum) / 21 
  let result = ''
  if (widthP == 0) {
    result = ''
  } else if (widthP < 1/12) {
    result = 'w-1/12'
  } else if (widthP < 2/12) {
    result = 'w-2/12'
  } else if (widthP < 3/12) {
    result = 'w-3/12'
  } else if (widthP < 4/12) {
    result = 'w-4/12'
  } else if (widthP < 5/12) {
    result = 'w-5/12'
  } else if (widthP < 6/12) {
    result = 'w-6/12'
  } else if (widthP < 7/12) {
    result = 'w-7/12'
  } else if (widthP < 8/12) {
    result = 'w-8/12'
  } else if (widthP < 9/12) {
    result = 'w-9/12'
  } else if (widthP < 10/12) {
    result = 'w-10/12'
  } else if (widthP < 11/12) {
    result = 'w-11/12'
  } else if (widthP < 12/12) {
    result = 'w-12/12'
  }

  return result
}
 
function queryGraphql<T>(api: string, query: string, variables: any): Promise<{ data: T | null }> {
    return fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      })
    }).then(r => {
      return r.json()
    }).then(
      res => {
        return res as { data: T };
      }
    );
  }