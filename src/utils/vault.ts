/**
 * Vault 관련 유틸리티
 * 
 * 각 인플루언서마다 Vault가 생성되며, 각 Vault에는 초기 유동성으로 30개 MON 토큰이 공급됩니다.
 * 사용자가 Long 포지션을 잡으면 Vault에서 자동으로 같은 가격으로 Short 포지션이 생성됩니다.
 */

import { BrowserProvider, JsonRpcSigner, Contract, parseUnits, formatUnits } from 'ethers'
import { INFLUENCER_VAULT_ADDRESS, VAULT_PRIVATE_KEY, MONAD_TESTNET_RPC, MON_PRICE_USDC } from '../config/monad'

// MonstarPerps 컨트랙트 ABI (간소화)
const MONSTAR_PERPS_ABI = [
  'function addLiquidity() payable',
  'function removeLiquidity(uint256 _amount)',
  'function openPosition(string memory _influencerId, bool _isLong) payable',
  'function closePosition(uint256 _positionId)',
  'function payFunding(uint256 _positionId) returns (int256)',
  'function checkLiquidation(uint256 _positionId) view returns (bool isLiquidatable, int256 currentPnL)',
  'function liquidatePosition(uint256 _positionId)',
  'function totalLiquidity() view returns (uint256)',
  'function lpBalances(address) view returns (uint256)',
  'function positions(uint256) view returns (uint256 id, address trader, string memory influencerId, bool isLong, uint256 entryPrice, uint256 collateral, bool isOpen, uint256 timestamp, uint256 lastFundingTime)',
  'function nextPositionId() view returns (uint256)',
  'function getContractBalance() view returns (uint256)',
  'function getLpBalance(address) view returns (uint256)',
  'function getPosition(uint256) view returns (tuple(uint256 id, address trader, string influencerId, bool isLong, uint256 entryPrice, uint256 collateral, bool isOpen, uint256 timestamp, uint256 lastFundingTime))',
  'function setInfluencerAddress(string memory _influencerId, address _influencerAddress)',
  'function owner() view returns (address)',
  'function withdraw(address payable _to, uint256 _amount)',
  'function transfer(address payable _to, uint256 _amount)',
  'function transferOwnership(address _newOwner)',
]

/**
 * Vault 컨트랙트 인스턴스 생성
 */
export async function getVaultContract(
  provider: BrowserProvider | null,
  signer: JsonRpcSigner | null
): Promise<Contract | null> {
  // signer만 있으면 충분함 (signer가 provider를 포함하고 있음)
  if (!signer) {
    console.error('Signer가 없습니다')
    return null
  }

  if (!INFLUENCER_VAULT_ADDRESS) {
    console.error('INFLUENCER_VAULT_ADDRESS가 설정되지 않았습니다')
    return null
  }

  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, signer)
    return contract
  } catch (error) {
    console.error('Vault 컨트랙트 생성 실패:', error)
    return null
  }
}

/**
 * Vault에 유동성 추가 (LP)
 */
export async function addLiquidityToVault(
  signer: JsonRpcSigner,
  amount: string // MON 단위
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const amountWei = parseUnits(amount, 18) // MON은 18 decimals
    const tx = await contract.addLiquidity({ value: amountWei })
    const receipt = await tx.wait()

    return { success: true, txHash: receipt.hash }
  } catch (error: any) {
    console.error('유동성 추가 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Vault에서 유동성 제거 (LP)
 */
export async function removeLiquidityFromVault(
  signer: JsonRpcSigner,
  amount: string // MON 단위
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const amountWei = parseUnits(amount, 18)
    const tx = await contract.removeLiquidity(amountWei)
    const receipt = await tx.wait()

    return { success: true, txHash: receipt.hash }
  } catch (error: any) {
    console.error('유동성 제거 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 포지션 오픈
 */
export async function openPosition(
  signer: JsonRpcSigner,
  influencerId: string,
  isLong: boolean,
  collateral: string // MON 단위
): Promise<{ success: boolean; positionId?: number; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const collateralWei = parseUnits(collateral, 18)
    const tx = await contract.openPosition(influencerId, isLong, { value: collateralWei })
    const receipt = await tx.wait()

    // 포지션 ID는 이벤트에서 가져와야 함 (간단히 nextPositionId - 1 사용)
    const nextId = await contract.nextPositionId()
    const positionId = Number(nextId) - 1

    return { success: true, positionId, txHash: receipt.hash }
  } catch (error: any) {
    console.error('포지션 오픈 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 포지션 종료
 */
export async function closePosition(
  signer: JsonRpcSigner,
  positionId: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const tx = await contract.closePosition(positionId)
    const receipt = await tx.wait()

    return { success: true, txHash: receipt.hash }
  } catch (error: any) {
    console.error('포지션 종료 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 펀딩피 지불
 */
export async function payFunding(
  signer: JsonRpcSigner,
  positionId: number
): Promise<{ success: boolean; fundingAmount?: string; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const tx = await contract.payFunding(positionId)
    const receipt = await tx.wait()

    // 펀딩피 금액은 이벤트에서 가져와야 함 (간단화를 위해 0 반환)
    return { success: true, fundingAmount: '0', txHash: receipt.hash }
  } catch (error: any) {
    console.error('펀딩피 지불 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 청산 가능 여부 확인
 */
export async function checkLiquidation(
  provider: BrowserProvider,
  positionId: number
): Promise<{ isLiquidatable: boolean; currentPnL: string } | null> {
  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, provider)
    const result = await contract.checkLiquidation(positionId)
    return {
      isLiquidatable: result.isLiquidatable,
      currentPnL: formatUnits(result.currentPnL >= 0 ? result.currentPnL : -result.currentPnL, 18),
    }
  } catch (error) {
    console.error('청산 확인 실패:', error)
    return null
  }
}

/**
 * Vault 총 유동성 조회
 */
export async function getTotalLiquidity(provider: BrowserProvider): Promise<string | null> {
  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, provider)
    const liquidity = await contract.totalLiquidity()
    return formatUnits(liquidity, 18)
  } catch (error) {
    console.error('유동성 조회 실패:', error)
    return null
  }
}

/**
 * LP 잔액 조회
 */
export async function getLpBalance(
  provider: BrowserProvider,
  address: string
): Promise<string | null> {
  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, provider)
    const balance = await contract.lpBalances(address)
    return formatUnits(balance, 18)
  } catch (error) {
    console.error('LP 잔액 조회 실패:', error)
    return null
  }
}

/**
 * 포지션 정보 조회
 */
export async function getPosition(
  provider: BrowserProvider,
  positionId: number
): Promise<any | null> {
  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, provider)
    const position = await contract.getPosition(positionId)
    return {
      id: Number(position.id),
      trader: position.trader,
      influencerId: position.influencerId,
      isLong: position.isLong,
      entryPrice: Number(position.entryPrice),
      collateral: formatUnits(position.collateral, 18),
      isOpen: position.isOpen,
      timestamp: Number(position.timestamp),
    }
  } catch (error) {
    console.error('포지션 조회 실패:', error)
    return null
  }
}

/**
 * Owner: 컨트랙트의 MON 인출
 */
export async function withdrawFromVault(
  signer: JsonRpcSigner,
  to: string,
  amount: string // MON 단위
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const amountWei = parseUnits(amount, 18)
    const tx = await contract.withdraw(to, amountWei)
    const receipt = await tx.wait()

    return { success: true, txHash: receipt.hash }
  } catch (error: any) {
    console.error('인출 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Owner: 컨트랙트의 MON 전송
 */
export async function transferFromVault(
  signer: JsonRpcSigner,
  to: string,
  amount: string // MON 단위
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const contract = await getVaultContract(null, signer)
    if (!contract) {
      return { success: false, error: 'Contract not initialized' }
    }

    const amountWei = parseUnits(amount, 18)
    const tx = await contract.transfer(to, amountWei)
    const receipt = await tx.wait()

    return { success: true, txHash: receipt.hash }
  } catch (error: any) {
    console.error('전송 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Owner: 컨트랙트 owner 조회
 */
export async function getVaultOwner(provider: BrowserProvider): Promise<string | null> {
  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, provider)
    const owner = await contract.owner()
    return owner
  } catch (error) {
    console.error('Owner 조회 실패:', error)
    return null
  }
}

/**
 * 사용자의 모든 포지션 조회 (활성 + 종료)
 */
export async function getUserPositions(
  provider: BrowserProvider,
  userAddress: string
): Promise<any[]> {
  try {
    const contract = new Contract(INFLUENCER_VAULT_ADDRESS, MONSTAR_PERPS_ABI, provider)
    const nextId = await contract.nextPositionId()
    const positionCount = Number(nextId)
    
    const allPositions: any[] = []
    
    // 모든 포지션을 순회하면서 사용자의 포지션만 필터링
    for (let i = 1; i < positionCount; i++) {
      try {
        const position = await contract.getPosition(i)
        if (position.trader.toLowerCase() === userAddress.toLowerCase()) {
          allPositions.push({
            id: String(position.id),
            trader: position.trader,
            influencerId: position.influencerId,
            yapperId: position.influencerId, // yapperId도 추가
            type: position.isLong ? 'long' : 'short',
            isLong: position.isLong,
            entryPrice: Number(position.entryPrice),
            collateral: formatUnits(position.collateral, 18),
            isOpen: position.isOpen,
            timestamp: Number(position.timestamp) * 1000, // 밀리초로 변환
            leverage: 1, // 기본값 (실제로는 계산 필요)
            size: parseFloat(formatUnits(position.collateral, 18)) * MON_PRICE_USDC,
            liquidationPrice: 0, // 계산 필요
            currentPnL: 0, // 계산 필요
            pnlPercentage: 0, // 계산 필요
          })
        }
      } catch (error) {
        // 포지션이 없거나 오류 발생 시 건너뛰기
        continue
      }
    }
    
    return allPositions
  } catch (error) {
    console.error('포지션 조회 실패:', error)
    return []
  }
}

/**
 * 사용자의 활성 포지션만 조회
 */
export async function getUserActivePositions(
  provider: BrowserProvider,
  userAddress: string
): Promise<any[]> {
  const allPositions = await getUserPositions(provider, userAddress)
  return allPositions.filter(p => p.isOpen)
}

/**
 * 사용자의 종료된 포지션만 조회
 */
export async function getUserClosedPositions(
  provider: BrowserProvider,
  userAddress: string
): Promise<any[]> {
  const allPositions = await getUserPositions(provider, userAddress)
  return allPositions.filter(p => !p.isOpen)
}
