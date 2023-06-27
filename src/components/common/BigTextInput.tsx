import { Input, type InputProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const BigTextInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <Input ref={ref} height="1.75em" fontSize="2xl" {...props}/>
})

BigTextInput.displayName = 'BigTextInput'
