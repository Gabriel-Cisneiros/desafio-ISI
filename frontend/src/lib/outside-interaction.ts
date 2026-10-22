interface OutsideEvent {
  detail: { originalEvent: Event };
  preventDefault: () => void;
}

export function keepToasterInteractive<E extends OutsideEvent>(
  handler?: (event: E) => void,
) {
  return (event: E) => {
    const target = event.detail.originalEvent.target;
    if (target instanceof Element && target.closest('[data-toaster]')) {
      event.preventDefault();
    }
    handler?.(event);
  };
}
