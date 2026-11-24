const STORAGE_KEY = 'sh-notes-data';

let notes = loadNotes();
let currentId = null;

const el = {
  count: document.getElementById('notesCount'),
    list: document.getElementById('notesList'),
      empty: document.getElementById('emptyState'),
        noResults: document.getElementById('noResults'),
          search: document.getElementById('searchInput'),
            addBtn: document.getElementById('addBtn'),
              modal: document.getElementById('editorModal'),
                editorTitle: document.getElementById('editorTitle'),
                  titleInput: document.getElementById('noteTitle'),
                    contentInput: document.getElementById('noteContent'),
                      meta: document.getElementById('noteMeta'),
                        saveBtn: document.getElementById('saveBtn'),
                          cancelBtn: document.getElementById('cancelBtn'),
                            deleteBtn: document.getElementById('deleteBtn')
                            };

                            /* ===== التخزين ===== */
                            function loadNotes() {
                              try {
                                  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
                                      return Array.isArray(data) ? data : [];
                                        } catch (error) {
                                            return [];
                                              }
                                              }

                                              function saveNotes() {
                                                localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
                                                }

                                                /* ===== أدوات مساعدة ===== */
                                                function formatDate(isoString) {
                                                  return new Date(isoString).toLocaleString('ar', {
                                                      year: 'numeric',
                                                          month: 'long',
                                                              day: 'numeric',
                                                                  hour: '2-digit',
                                                                      minute: '2-digit'
                                                                        });
                                                                        }

                                                                        function generateId() {
                                                                          return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                                                                          }

                                                                          /* ===== العرض ===== */
                                                                          function render() {
                                                                            const query = el.search.value.trim().toLowerCase();

                                                                              const filtered = notes
                                                                                  .filter(note =>
                                                                                        !query ||
                                                                                              note.title.toLowerCase().includes(query) ||
                                                                                                    note.content.toLowerCase().includes(query)
                                                                                                        )
                                                                                                            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                                                                                                              el.count.textContent = notes.length;
                                                                                                                el.list.innerHTML = '';

                                                                                                                  el.empty.classList.toggle('hidden', notes.length !== 0);
                                                                                                                    el.noResults.classList.toggle('hidden', !(notes.length !== 0 && filtered.length === 0));

                                                                                                                      filtered.forEach(note => el.list.appendChild(createCard(note)));
                                                                                                                      }

                                                                                                                      function createCard(note) {
                                                                                                                        const card = document.createElement('article');
                                                                                                                          card.className = 'note-card';

                                                                                                                            const title = document.createElement('h3');
                                                                                                                              title.textContent = note.title || 'بدون عنوان';

                                                                                                                                const preview = document.createElement('p');
                                                                                                                                  preview.className = 'note-preview';
                                                                                                                                    preview.textContent = note.content.slice(0, 150) || 'ملاحظة فارغة';

                                                                                                                                      const footer = document.createElement('div');
                                                                                                                                        footer.className = 'note-footer';

                                                                                                                                          const date = document.createElement('span');
                                                                                                                                            date.textContent = 'آخر تعديل: ' + formatDate(note.updatedAt);

                                                                                                                                              const deleteBtn = document.createElement('button');
                                                                                                                                                deleteBtn.className = 'icon-btn';
                                                                                                                                                  deleteBtn.title = 'حذف';
                                                                                                                                                    deleteBtn.textContent = '🗑';
                                                                                                                                                      deleteBtn.addEventListener('click', event => {
                                                                                                                                                          event.stopPropagation();
                                                                                                                                                              deleteNote(note.id);
                                                                                                                                                                });

                                                                                                                                                                  footer.append(date, deleteBtn);
                                                                                                                                                                    card.append(title, preview, footer);
                                                                                                                                                                      card.addEventListener('click', () => openEditor(note.id));

                                                                                                                                                                        return card;
                                                                                                                                                                        }

                                                                                                                                                                        /* ===== النافذة ===== */
                                                                                                                                                                        function openEditor(id = null) {
                                                                                                                                                                          currentId = id;
                                                                                                                                                                            const note = id ? notes.find(n => n.id === id) : null;

                                                                                                                                                                              el.titleInput.value = note ? note.title : '';
                                                                                                                                                                                el.contentInput.value = note ? note.content : '';
                                                                                                                                                                                  el.editorTitle.textContent = note ? 'تعديل الملاحظة' : 'ملاحظة جديدة';

                                                                                                                                                                                    el.meta.textContent = note
                                                                                                                                                                                        ? `تاريخ الإنشاء: ${formatDate(note.createdAt)} · آخر تعديل: ${formatDate(note.updatedAt)}`
                                                                                                                                                                                            : `تاريخ الإنشاء: ${formatDate(new Date().toISOString())}`;

                                                                                                                                                                                              el.deleteBtn.classList.toggle('hidden', !note);
                                                                                                                                                                                                el.modal.classList.remove('hidden');
                                                                                                                                                                                                  document.body.classList.add('modal-open');
                                                                                                                                                                                                    el.titleInput.focus();
                                                                                                                                                                                                    }

                                                                                                                                                                                                    function closeEditor() {
                                                                                                                                                                                                      el.modal.classList.add('hidden');
                                                                                                                                                                                                        document.body.classList.remove('modal-open');
                                                                                                                                                                                                          currentId = null;
                                                                                                                                                                                                          }

                                                                                                                                                                                                          /* ===== العمليات ===== */
                                                                                                                                                                                                          function saveNote() {
                                                                                                                                                                                                            const title = el.titleInput.value.trim();
                                                                                                                                                                                                              const content = el.contentInput.value.trim();

                                                                                                                                                                                                                if (!title && !content) {
                                                                                                                                                                                                                    alert('الملاحظة فارغة، اكتبي شيئًا قبل الحفظ');
                                                                                                                                                                                                                        return;
                                                                                                                                                                                                                          }

                                                                                                                                                                                                                            const now = new Date().toISOString();

                                                                                                                                                                                                                              if (currentId) {
                                                                                                                                                                                                                                  const note = notes.find(n => n.id === currentId);
                                                                                                                                                                                                                                      if (note) {
                                                                                                                                                                                                                                            note.title = title || 'بدون عنوان';
                                                                                                                                                                                                                                                  note.content = content;
                                                                                                                                                                                                                                                        note.updatedAt = now;
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                                  notes.push({
                                                                                                                                                                                                                                                                        id: generateId(),
                                                                                                                                                                                                                                                                              title: title || 'بدون عنوان',
                                                                                                                                                                                                                                                                                    content,
                                                                                                                                                                                                                                                                                          createdAt: now,
                                                                                                                                                                                                                                                                                                updatedAt: now
                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                        saveNotes();
                                                                                                                                                                                                                                                                                                          closeEditor();
                                                                                                                                                                                                                                                                                                            render();
                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                            function deleteNote(id) {
                                                                                                                                                                                                                                                                                                              if (!confirm('هل أنتِ متأكدة من حذف هذه الملاحظة؟')) return;

                                                                                                                                                                                                                                                                                                                notes = notes.filter(n => n.id !== id);
                                                                                                                                                                                                                                                                                                                  saveNotes();

                                                                                                                                                                                                                                                                                                                    if (currentId === id) closeEditor();
                                                                                                                                                                                                                                                                                                                      render();
                                                                                                                                                                                                                                                                                                                      }

                                                                                                                                                                                                                                                                                                                      /* ===== الأحداث ===== */
                                                                                                                                                                                                                                                                                                                      el.addBtn.addEventListener('click', () => openEditor());
                                                                                                                                                                                                                                                                                                                      el.saveBtn.addEventListener('click', saveNote);
                                                                                                                                                                                                                                                                                                                      el.cancelBtn.addEventListener('click', closeEditor);
                                                                                                                                                                                                                                                                                                                      el.deleteBtn.addEventListener('click', () => {
                                                                                                                                                                                                                                                                                                                        if (currentId) deleteNote(currentId);
                                                                                                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                                                                                                        el.search.addEventListener('input', render);

                                                                                                                                                                                                                                                                                                                        el.modal.addEventListener('click', event => {
                                                                                                                                                                                                                                                                                                                          if (event.target === el.modal) closeEditor();
                                                                                                                                                                                                                                                                                                                          });

                                                                                                                                                                                                                                                                                                                          document.addEventListener('keydown', event => {
                                                                                                                                                                                                                                                                                                                            if (event.key === 'Escape' && !el.modal.classList.contains('hidden')) {
                                                                                                                                                                                                                                                                                                                                closeEditor();
                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                  });

                                                                                                                                                                                                                                                                                                                                  /* ===== البدء ===== */
                                                                                                                                                                                                                                                                                                                                  render();
                                                                                                                                                                                                                                                                                                                                  