// Variables //

let isDragging = false;
let startY = 0;
let startTop = 0;
let scrollInterval;

const contactThumb = document.querySelector(".custom-thumb");
const contactTrack = document.querySelector(".custom-scrollbar");
const contactsContainer = document.querySelector(".scrollwrapper-contacts");


/**
 * Initializes the custom scrollbar thumb for the contact list: sets
 * its fixed height and (re-)attaches the scroll listener that keeps
 * the thumb position in sync.
 *
 * @returns {void}
 */
function initScrollbar() {
    const liste = document.querySelector('.new-contact');
    const thumb = document.querySelector('.custom-thumb');
    const leiste = document.querySelector('.custom-scrollbar');
 
    thumb.style.height = '56px';
    liste.removeEventListener('scroll', updateScrollbar);
    liste.addEventListener('scroll', updateScrollbar);
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
    const maxTop =
        contactTrack.clientHeight - contactThumb.clientHeight;

    const scrollRatio =
        contactsContainer.scrollTop /
        (contactsContainer.scrollHeight -
            contactsContainer.clientHeight);

    contactThumb.style.top = `${scrollRatio * maxTop}px`;
}


// Event Listeners //

/**
 * Starts dragging the custom scrollbar thumb.
 *
 * @param {MouseEvent} event - The mouse event triggered when the thumb is pressed.
 * @returns {void}
 */
contactThumb.addEventListener("mousedown", (event) => {
    isDragging = true;
    startY = event.clientY;
    startTop = contactThumb.offsetTop;
    document.body.style.userSelect = "none";
});


/**
 * Stops dragging the custom scrollbar thumb.
 *
 * @returns {void}
 */
document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
});


/**
 * Moves the custom scrollbar thumb while dragging
 * and synchronizes the contact list scroll position.
 *
 * @param {MouseEvent} event - The mouse move event.
 * @returns {void}
 */
document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;
    const deltaY = event.clientY - startY;
    let newTop = startTop + deltaY;

    const maxTop =
        contactTrack.clientHeight - contactThumb.clientHeight;

    newTop = Math.max(0, Math.min(newTop, maxTop));
    contactThumb.style.top = `${newTop}px`;
    const scrollRatio = newTop / maxTop;

    contactsContainer.scrollTop =
        scrollRatio *
        (contactsContainer.scrollHeight -
            contactsContainer.clientHeight);
});


/**
 * Synchronizes the thumb whenever the contact
 * list is scrolled.
 */
contactsContainer.addEventListener(
    "scroll",
    updateThumbPosition
);