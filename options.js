 function Load() {
     chrome.storage.local.get(['selected_recorder'], function(items) {
         document.getElementById('recorder').value = items.selected_recorder ? items.selected_recorder : "MK8DXRecords Staff";
     });
 }

 function Save() {
     var recorder = document.getElementById('recorder').value;
     chrome.storage.local.set({ 'selected_recorder': recorder }, function() {});
 }

 document.addEventListener('DOMContentLoaded', function() {
     Load();

     const button = document.getElementById('save_button');
     const box = document.getElementById('mybox');
     button.addEventListener("click", function() {
         Save();
         if (getComputedStyle(box).getPropertyValue('opacity') == 0) box.classList.toggle('is-show');
     });
 });