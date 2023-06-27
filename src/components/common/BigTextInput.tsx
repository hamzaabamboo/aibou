import { Input, type InputProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const BigTextInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <Input ref={ref} height="2em" fontSize="2xl" {...props}/>
})

BigTextInput.displayName = 'BigTextInput'
