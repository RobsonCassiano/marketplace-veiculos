// Test file to check if modules are loading
console.log('test-modules.js loaded');

try {
  import('./sharedStyles.js').then(module => {
    console.log('sharedStyles.js imported successfully');
    console.log('bootstrapSheet type:', typeof module.bootstrapSheet);
  }).catch(err => {
    console.error('Failed to import sharedStyles.js:', err);
  });
} catch (err) {
  console.error('Error in import statement:', err);
}

try {
  import('./CarCard.js').then(module => {
    console.log('CarCard.js imported successfully');
    console.log('CarCard class:', typeof module.CarCard);
  }).catch(err => {
    console.error('Failed to import CarCard.js:', err);
  });
} catch (err) {
  console.error('Error in CarCard import:', err);
}

try {
  import('./animation.js').then(module => {
    console.log('animation.js imported successfully');
  }).catch(err => {
    console.error('Failed to import animation.js:', err);
  });
} catch (err) {
  console.error('Error in animation import:', err);
}
