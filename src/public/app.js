let editingId = null;

async function fetchNotes() {
    try {
        const response = await fetch('/api/notes');
        const notes = await response.json();
        displayNotes(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

function displayNotes(notes) {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = notes.map(note => `
        <div class="note" data-id="${note.id}">
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button onclick="editNote('${note.id}', '${escapeHtml(note.title)}', '${escapeHtml(note.content)}')">Edit</button>
                <button class="delete-btn" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function saveNote() {
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    
    if (!titleInput.value.trim() || !contentInput.value.trim()) {
        alert('Please fill in both title and content');
        return;
    }

    const note = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim()
    };

    try {
        const url = editingId ? `/api/notes/${editingId}` : '/api/notes';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(note)
        });

        if (response.ok) {
            titleInput.value = '';
            contentInput.value = '';
            editingId = null;
            fetchNotes();
        } else {
            throw new Error('Failed to save note');
        }
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Failed to save note. Please try again.');
    }
}

function editNote(id, title, content) {
    editingId = id;
    document.getElementById('title').value = title;
    document.getElementById('content').value = content;
    document.getElementById('title').focus();
}

async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        const response = await fetch(`/api/notes/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchNotes();
        } else {
            throw new Error('Failed to delete note');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
    }
}

// Initial load
fetchNotes();

// Add event listeners for keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveNote();
    }
});