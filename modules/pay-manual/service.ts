import { getAppContext } from '../../core/context.js'

export async function getManualSettings() {
  const { settings } = getAppContext()
  return {
    bankName: (await settings.get('manual_bank_name')) || 'Bank Transfer',
    accountNumber: (await settings.get('manual_account_number')) || '-',
    accountName: (await settings.get('manual_account_name')) || '-',
    instructions: (await settings.get('manual_instructions')) || 'Please transfer the exact amount.',
  }
}
