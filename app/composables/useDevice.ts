export default function () {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return { isMobile }
}
