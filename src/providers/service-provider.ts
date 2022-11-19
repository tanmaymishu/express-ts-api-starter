export default interface ServiceProvider {
  register: () => void
  boot: () => void
};;;;;;;;;;
