/**
 * Monad Testnet 설정
 */

// Monad Testnet 네트워크 정보
export const MONAD_TESTNET_CHAIN_ID = 10143
export const MONAD_TESTNET_RPC = 'https://testnet-rpc.monad.xyz'

export const MONAD_TESTNET_CONFIG = {
  chainId: `0x${MONAD_TESTNET_CHAIN_ID.toString(16)}`, // 0x279F
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: [MONAD_TESTNET_RPC],
  blockExplorerUrls: ['https://testnet.monadscan.com'],
}

// MON 토큰 가격 (USDC 기준)
// 실제 운영 환경에서는 Oracle이나 API에서 가져와야 합니다.
export const MON_PRICE_USDC = 20.0

// Vault 컨트랙트 주소
// 배포 후 실제 주소로 업데이트 필요
export const INFLUENCER_VAULT_ADDRESS = '0xe4784dde2ed5abCE7Ca896e862aE7ce11C16e857'

// Vault Owner 주소
export const VAULT_OWNER_ADDRESS = '0x91DcF137f42130E5095558Ee1D143F0282B114B0'

/**
 * Vault Private Key는 환경 변수로 관리해야 합니다.
 * 
 * .env 파일에 다음을 추가하세요:
 * VAULT_PRIVATE_KEY=your_private_key_here
 * 
 * 그리고 이 파일에서 다음과 같이 사용:
 * export const VAULT_PRIVATE_KEY = import.meta.env.VAULT_PRIVATE_KEY || ''
 * 
 * ⚠️ 주의: Private Key는 절대 Git에 커밋하지 마세요!
 */
export const VAULT_PRIVATE_KEY = import.meta.env.VAULT_PRIVATE_KEY || ''

// 각 인플루언서 Vault의 초기 유동성 (MON 토큰)
// 실제로는 Vault 주소에 60개 MON이 예치되어 있음
export const VAULT_INITIAL_LIQUIDITY = 60

