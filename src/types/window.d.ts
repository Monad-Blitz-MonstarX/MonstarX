/**
 * Window 객체에 ethereum 속성 타입 정의
 * MetaMask 및 기타 Web3 지갑의 window.ethereum API
 */
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (...args: any[]) => void) => void
    removeListener: (event: string, callback: (...args: any[]) => void) => void
    isMetaMask?: boolean
    isConnected?: boolean
    selectedAddress?: string
  }
}

