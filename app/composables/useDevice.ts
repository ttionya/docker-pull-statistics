export default function () {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return { isMobile }
}
