import "../global.css"

export type ButtonTypeProp = 'submit' | 'reset' | 'button';

export type ButtonSizeProp = 'small' | 'medium' | 'large' | 'huge'

export type ButtonProps = Omit<React.HTMLProps<HTMLButtonElement>, 'type' | 'size'> & {
  type?: ButtonTypeProp;
  primary?: boolean;
  secondary?: boolean;
  size?: ButtonSizeProp;
};

export function Button({
  className: extraClassName,
  style: extraStyle,
  primary,
  secondary,
  size = 'medium',
  ...props
}: ButtonProps) {
  let className = 'block cursor-pointer rounded-md focus:outline-2 outline-black transition-colors font-bold';
  if (primary) {
    className += ' bg-red-500 hover:bg-red-400 active:bg-red-500 text-white';
  } else if (secondary) {
    className += ' bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-500 text-white';
  } else {
    className += ' bg-gray-500 hover:bg-gray-400 active:bg-gray-500 text-white';
  }
  if (extraClassName) {
    className += ' ' + extraClassName;
  }
  const style = { ...extraStyle };
  switch (size) {
    case 'small':
      style.fontSize = '0.8rem';
      style.minWidth = '2rem';
      style.padding = '0.4rem 0.8rem';
      break;
    case 'medium':
      style.fontSize = '1rem';
      style.minWidth = '3rem';
      style.padding = '0.5rem 1rem';
      break;
    case 'large':
      style.fontSize = '2rem';
      style.minWidth = '5rem';
      style.padding = '1rem 2rem';
      break;
    case 'huge':
      style.fontSize = '3rem';
      style.minWidth = '10rem';
      style.padding = '1.5rem 3rem';
      break;
  }
  style.boxSizing = 'content-box'
  style.minHeight = '1em';
  return <button {...props} className={className} style={style} />;
}

export default Button;
