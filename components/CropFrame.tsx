export default function CropFrame() {
  const mark = 'absolute h-4 w-4 border-ochre'
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 z-10">
      <span className={`${mark} left-0 top-0 border-l border-t`} />
      <span className={`${mark} right-0 top-0 border-r border-t`} />
      <span className={`${mark} left-0 bottom-0 border-l border-b`} />
      <span className={`${mark} right-0 bottom-0 border-r border-b`} />
    </div>
  )
}
