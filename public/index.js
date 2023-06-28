const carouselContainer = document.querySelector('.carousel-container');
const columnButtons = document.querySelectorAll('.column-button');

function zoomIn(index) {
  const columns = document.querySelectorAll('.column');
  columns.forEach((column, i) => {
    column.style.transform = i === index ? 'scale(1)' : 'scale(0.8)';
  });

  columnButtons.forEach((button, i) => {
    button.classList.toggle('active', i === index);
  });

  // Centrar la columna seleccionada en el carrusel
  const selectedColumn = columns[index];
  const scrollLeft = selectedColumn.offsetLeft - carouselContainer.offsetLeft;
  carouselContainer.scrollLeft = scrollLeft;
}

columnButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    zoomIn(index);
  })
});
 

  
