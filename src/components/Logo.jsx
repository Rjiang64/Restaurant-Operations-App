// To use your own logo: save it as `public/logo.png` (ideally with a
// transparent background so it reads on dark surfaces too).
// To use a different filename or format, change LOGO_SRC below.
const LOGO_SRC = '/logo.png'

export default function Logo({ size = 38, alt = 'Kitchen Manager' }) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className="logo"
      style={{ width: size, height: size }}
      onError={(e) => {
        // If the asset is missing, hide the broken-image icon
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
  )
}
