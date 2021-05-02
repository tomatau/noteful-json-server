function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'Test Note One',
            modified: '2029-12-22T16:28:32.615Z',
            folderid: 1,
            content: 'Lorem ispum duis autem...'
        },
        {
            id: 2,
            name: 'Test Note Two',
            modified: '2019-12-22T16:28:32.615Z',
            folderid: 1,
            content: 'Duis autem forse...'
        },
        {
            id: 3,
            name: 'Test Note Three',
            modified: '1929-12-22T16:28:32.615Z',
            folderid: 1,
            content: 'Trespequi et invictus...'
        },
    ];
}

function makeMaliciousNote() {

    // `folderid` for GET
    const getMaliciousNote = {
        id: 911,
        name: `Naughty naughty <script>alert("xss");</script>`,
        modified: '2029-12-22T16:28:32.615Z',
        folderid: 1,
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const getExpectedNote = {
        ... getMaliciousNote,
        name: `Naughty naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`, // converts script to render it inert
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`, // onerror="alert(document.cookie);" gets removed
    } 
    
    // `folderId` for POST
    const postMaliciousNote = {
        ... getMaliciousNote,
        folderId: 1,
    }
    const postExpectedNote = {
        ... getExpectedNote,
        folderId: 1,
    }    

    return {
        getMaliciousNote,
        getExpectedNote,
        postMaliciousNote,
        postExpectedNote,
    }
}

module.exports = {
    makeNotesArray,
    makeMaliciousNote,
}