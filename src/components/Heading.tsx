
export type HeaderProps = React.HTMLProps<HTMLHeadingElement>;

export function Heading({
  className: extraClassName,
  ...props
}: HeaderProps) {
  let className = "font-bold text-2xl";
  if (extraClassName) {
    className += ' ' + extraClassName;
  }
  return <h1 className={className} {...props} />
}
