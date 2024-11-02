const fs = require('fs').promises;   
const readline = require('readline');   

class MovieRecommendationSystem {   
    constructor() {   
        this.movies = [];   
        this.preferences = {   
            genres: [],   
            minRating: 0,   
            yearRange: {   
                start: 1900,   
                end: 2023   
            }   
        };   
    }   

    async loadMovies(filename) {   
        try {   
            const data = await fs.readFile(filename, 'utf8');   
            this.movies = JSON.parse(data);   
        } catch (error) {   
            if (error.code === 'ENOENT') {   
                console.log(`File ${filename} not found. Creating a new one.`);   
                this.movies = [];   
            } else {   
                throw error;   
            }   
        }   
    }   

    async savePreferencesToFile(filename) {   
        await fs.writeFile(filename, JSON.stringify(this.preferences, null, 2));   
    }   

    
    getRecommendations() {   
        return this.movies.filter(movie => {   
            const matchesGenre = this.preferences.genres.length === 0 ||   
                                 this.preferences.genres.some(genre => movie.genre.includes(genre));   
            const matchesRating = movie.rating >= this.preferences.minRating;   
            const matchesYear = movie.year >= this.preferences.yearRange.start &&   
                                movie.year <= this.preferences.yearRange.end;   
            return matchesGenre && matchesRating && matchesYear;   
        });   
    }   

    setPreferences(genres, minRating, startYear, endYear) {   
        this.preferences.genres = genres;   
        this.preferences.minRating = minRating;   
        this.preferences.yearRange = {   
            start: startYear,   
            end: endYear   
        };   
    }   
}   

async function main() {   
    const system = new MovieRecommendationSystem();   
    await system.loadMovies('./Data/movieData.json');   

    const rl = readline.createInterface({   
        input: process.stdin,   
        output: process.stdout   
    });   

    const askQuestion = question => new Promise(resolve => rl.question(question, resolve));   

    const genreInput = await askQuestion("Enter your favorite genres (comma separated): ");   
    const genres = genreInput.split(',').map(g => g.trim()).filter(g => g);   

    const minRating = parseFloat(await askQuestion("Enter minimum rating: "));   
    const startYear = parseInt(await askQuestion("Enter start year: "));   
    const endYear = parseInt(await askQuestion("Enter end year: "));   

    system.setPreferences(genres, minRating, startYear, endYear);   
    await system.savePreferencesToFile('./Data/userPreferences.json');   

    const recommendations = system.getRecommendations();   
    console.log("\nRecommended Movies:");   
    recommendations.forEach(movie => console.log(`${movie.title} (${movie.year}) - ${movie.genre} - Rating: ${movie.rating}`));   

    rl.close();   
}   

main().catch(console.error);