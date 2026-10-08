type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler = () => {}

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

export function handleUnauthorized() {
  unauthorizedHandler()
}
