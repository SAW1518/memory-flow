'use server'
import { z } from 'zod'
import { createWordSchema } from './action.typs'



export const createInvoice = async (formData: FormData): Promise<void> => {
 const newWord = createWordSchema.parse({
  word: formData.get('word')
 })

 console.log(newWord)
} 