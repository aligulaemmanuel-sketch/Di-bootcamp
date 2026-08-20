class Video {
    constructor(title, uploader, time) {
        this.title = title;
        this.uploader = uploader;
        this.time = time;
    }

    watch() {
        console.log(`${this.uploader} watched all ${this.time} seconds of ${this.title}!`);
    }
}

// 3 & 4. Instantiate and call watch
const vid1 = new Video("Cloud Infrastructure 101", "Tocky Manu", 300);
vid1.watch();

const vid2 = new Video("Nostalgic Beats", "Nostalgia Official", 600);
vid2.watch();

// 5. Bonus: Array of data
const videoData = [
    { title: "JavaScript Methods", uploader: "DevInst", time: 120 },
    { title: "React Basics", uploader: "CodeMaster", time: 240 },
    { title: "CSS Flexbox", uploader: "StylePro", time: 180 },
    { title: "Node.js Intro", uploader: "BackendGuru", time: 300 },
    { title: "Git Workflow", uploader: "RepoKing", time: 150 }
];

// 6. Bonus: Loop through to instantiate
const videoInstances = videoData.map(v => new Video(v.title, v.uploader, v.time));

videoInstances.forEach(vid => vid.watch());