
export type ButtonTypeProp = 'submit' | 'reset' | 'button';

export type ButtonProps = Omit<React.HTMLProps<HTMLButtonElement>, 'type'> & { type?: ButtonTypeProp };

export function Button({
  className: extraClassName,
  ...props
}: ButtonProps) {
  let className = 'block cursor-pointer rounded-md bg-red-500 hover:bg-red-400 active:bg-red-500 focus:outline-2 outline-black transition-colors font-bold p-2 text-white';
  if (extraClassName) {
    className += ' ' + extraClassName;
  }
  return <button {...props} className={className} />;
}

export default Button;
