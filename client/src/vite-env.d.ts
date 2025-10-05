/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MASTER_KEY: string
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_TEMPLATE_ID: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly VITE_GITHUB_RAW_URL: string
  readonly VITE_PAYPAL_CLIENT_ID: string
  readonly VITE_AWS_LAMBDA_PDF_URL: string
  readonly VITE_ETH_WALLET_ADDRESS: string
  readonly VITE_LINK_WALLET_ADDRESS: string
  readonly VITE_USDC_WALLET_ADDRESS: string
}
