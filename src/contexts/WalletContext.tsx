import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserProvider, JsonRpcSigner, formatUnits } from 'ethers'
import { MONAD_TESTNET_CHAIN_ID, MONAD_TESTNET_CONFIG } from '../config/monad'

interface WalletContextType {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isMonadTestnet: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchToMonadTestnet: () => Promise<void>
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
  getBalance: () => Promise<string | null>
  getMonBalance: () => Promise<string | null>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const WALLET_STORAGE_KEY = 'monstar_x_wallet'

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    // localStorage에서 저장된 주소 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(WALLET_STORAGE_KEY)
      return saved ? JSON.parse(saved).address : null
    }
    return null
  })
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)

  // 지갑 연결 함수
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask 또는 다른 Web3 지갑을 설치해주세요!')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    try {
      // 1. 계정 요청
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[]

      if (accounts.length === 0) {
        throw new Error('계정을 선택해주세요')
      }

      // 2. Ethers Provider 생성
      const browserProvider = new BrowserProvider(window.ethereum)
      
      // 3. 네트워크 정보 가져오기
      const network = await browserProvider.getNetwork()
      const chainIdNumber = Number(network.chainId)

      // 4. Signer 가져오기
      const signerInstance = await browserProvider.getSigner()

      setAddress(accounts[0])
      setChainId(chainIdNumber)
      setProvider(browserProvider)
      setSigner(signerInstance)

      // localStorage에 저장 (로그인 상태 유지)
      if (typeof window !== 'undefined') {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ address: accounts[0], chainId: chainIdNumber }))
      }

      // 5. Monad Testnet이 아니면 전환 요청
      if (chainIdNumber !== MONAD_TESTNET_CHAIN_ID) {
        await switchToMonadTestnet()
      }
    } catch (error: any) {
      console.error('지갑 연결 실패:', error)
      if (error.code === 4001) {
        alert('지갑 연결이 거부되었습니다.')
      } else {
        alert(`지갑 연결 중 오류가 발생했습니다: ${error.message}`)
      }
    }
  }

  // Monad Testnet으로 전환
  const switchToMonadTestnet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    try {
      // 먼저 전환 시도
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
      })

      // 전환 후 Provider와 Signer 재설정
      if (window.ethereum) {
        const browserProvider = new BrowserProvider(window.ethereum)
        const network = await browserProvider.getNetwork()
        const signerInstance = await browserProvider.getSigner()
        
        setChainId(Number(network.chainId))
        setProvider(browserProvider)
        setSigner(signerInstance)
      }
    } catch (switchError: any) {
      // 4902: 체인이 지갑에 추가되지 않음
      if (switchError.code === 4902) {
        try {
          // Monad Testnet 추가
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET_CONFIG],
          })

          // 추가 후 Provider와 Signer 재설정
          if (window.ethereum) {
            const browserProvider = new BrowserProvider(window.ethereum)
            const network = await browserProvider.getNetwork()
            const signerInstance = await browserProvider.getSigner()
            
            setChainId(Number(network.chainId))
            setProvider(browserProvider)
            setSigner(signerInstance)
          }
        } catch (addError: any) {
          console.error('네트워크 추가 실패:', addError)
          alert(`Monad Testnet 추가 실패: ${addError.message}`)
        }
      } else {
        console.error('네트워크 전환 실패:', switchError)
        alert(`Monad Testnet으로 전환 실패: ${switchError.message}`)
      }
    }
  }

  // 지갑 연결 해제
  const disconnectWallet = () => {
    setAddress(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
    // localStorage에서 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLET_STORAGE_KEY)
    }
  }

  // MON 잔액 조회 함수
  const getBalance = async (): Promise<string | null> => {
    if (!provider || !address) return null

    try {
      const balance = await provider.getBalance(address)
      return formatUnits(balance, 18) // MON은 18 decimals
    } catch (error) {
      console.error('MON 잔액 조회 실패:', error)
      return null
    }
  }

  // MON 잔액 조회 (별칭)
  const getMonBalance = getBalance

  // 계정 및 체인 변경 감지
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null)
        setChainId(null)
        setProvider(null)
        setSigner(null)
      } else {
        setAddress(accounts[0])
        // Provider와 Signer 재설정
        if (window.ethereum) {
          try {
            const browserProvider = new BrowserProvider(window.ethereum)
            const signerInstance = await browserProvider.getSigner()
            setProvider(browserProvider)
            setSigner(signerInstance)
          } catch (error) {
            console.error('Provider 재설정 실패:', error)
          }
        }
      }
    }

    const handleChainChanged = async (chainIdHex: string) => {
      const chainIdNumber = parseInt(chainIdHex, 16)
      setChainId(chainIdNumber)
      
      // Provider와 Signer 재설정
      if (window.ethereum) {
        try {
          const browserProvider = new BrowserProvider(window.ethereum)
          const signerInstance = await browserProvider.getSigner()
          setProvider(browserProvider)
          setSigner(signerInstance)
        } catch (error) {
          console.error('Provider 재설정 실패:', error)
        }
      }
      
      // Monad Testnet이 아니면 경고
      if (chainIdNumber !== MONAD_TESTNET_CHAIN_ID) {
        alert('Monad Testnet으로 전환해주세요!')
        // switchToMonadTestnet 호출은 사용자 액션으로만 수행
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    // 기존 연결 확인
    const checkConnection = async () => {
      if (!window.ethereum) return
      
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        }) as string[]

        if (accounts.length > 0) {
          const browserProvider = new BrowserProvider(window.ethereum)
          const network = await browserProvider.getNetwork()
          const chainIdNumber = Number(network.chainId)
          const signerInstance = await browserProvider.getSigner()

          setAddress(accounts[0])
          setChainId(chainIdNumber)
          setProvider(browserProvider)
          setSigner(signerInstance)
          
          // localStorage에 저장
          if (typeof window !== 'undefined') {
            localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ address: accounts[0], chainId: chainIdNumber }))
          }
        }
      } catch (error) {
        console.error('기존 연결 확인 실패:', error)
      }
    }

    checkConnection()

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected: !!address,
        isMonadTestnet: chainId === MONAD_TESTNET_CHAIN_ID,
        connectWallet,
        disconnectWallet,
        switchToMonadTestnet,
        provider,
        signer,
        getBalance,
        getMonBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
