async function getSunrises(lat1, lon1, lat2, lon2) {
    const url1 = `https://api.sunrise-sunset.org/json?lat=${lat1}&lng=${lon1}`;
    const url2 = `https://api.sunrise-sunset.org/json?lat=${lat2}&lng=${lon2}`;

    try {
        // Both requests start at the same time
        const [data1, data2] = await Promise.all([
            fetch(url1).then(res => {
                if (!res.ok) throw new Error(`Request 1 failed: ${res.status}`);
                return res.json();
            }),
            fetch(url2).then(res => {
                if (!res.ok) throw new Error(`Request 2 failed: ${res.status}`);
                return res.json();
            })
        ]);

        return [data1.results.sunrise, data2.results.sunrise];
    } catch (error) {
        alert("Error fetching sunrise data. Please check coordinates.");
        return null;
    }
}