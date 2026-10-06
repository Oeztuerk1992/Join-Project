/* ========================================
Variables / Init
======================================== */

let isDragging = false;
let startY = 0;
let startTop = 0;
let scrollInterval;

const contactThumb = document.querySelector(".custom-thumb");
const contactTrack = document.querySelector(".custom-scrollbar");
const contactsContainer = document.querySelector(".scrollwrapper-contacts");


/**
 * Initializes the custom scrollbar thumb for the contact list
 *
 * @returns {void}
 */
function initScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    thumb.style.height = '56px';
    liste.removeEventListener('scroll', updateScrollbar);
    liste.addEventListener('scroll', updateScrollbar);
    initThumbSync();
}
 
 
/**
 * Updates the custom scrollbar thumb's vertical position to match the
 * contact list's current scroll position.
 *
 * @returns {void}
 */
function updateScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    const leiste = document.querySelector('.custom-scrollbar');
    const scrollProzent = liste.scrollTop / (liste.scrollHeight - liste.clientHeight);
    const thumbPosition = scrollProzent * (leiste.clientHeight - 56);
    thumb.style.top = thumbPosition + 'px';
}


/**
 * Updates the thumb position based on the current
 * scroll position of the contact list.
 *
 * @returns {void}
 */
function updateThumbPosition() {
    const maxTop = contactTrack.clientHeight - contactThumb.clientHeight;
    const scrollRatio =
        contactsContainer.scrollTop /
        (contactsContainer.scrollHeight -
            contactsContainer.clientHeight);
    contactThumb.style.top = `${scrollRatio * maxTop}px`;
}


/**
 * Registers the scroll listener that syncs the thumb with the contact list.
 * @returns {void}
 */
function initThumbSync() {
    contactsContainer.addEventListener("scroll", updateThumbPosition);
}


/* ========================================
Event Listeners
======================================== */

/**
 * Starts dragging the custom scrollbar thumb when it is pressed.
 */
contactThumb.addEventListener("mousedown", (event) => {
    isDragging = true;
    startY = event.clientY;
    startTop = contactThumb.offsetTop;
    document.body.style.userSelect = "none";
});


/**
 * Stops dragging the custom scrollbar thumb when the mouse button is released.
 */
document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
});


/**
 * Moves the scrollbar thumb while dragging and syncs the contact list scroll position.
 */
document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    const newTop = startTop + event.clientY - startY;
    const maxTop = contactTrack.clientHeight - contactThumb.clientHeight;
    const clampedTop = Math.max(0, Math.min(newTop, maxTop));
    const scrollRange = contactsContainer.scrollHeight - contactsContainer.clientHeight;
    contactThumb.style.top = `${clampedTop}px`;
    contactsContainer.scrollTop = (clampedTop / maxTop) * scrollRange;
});