export const getHello = (req, res) => {
    res.json({
        message: 'Hello from Teamera API!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
};

export default {
    getHello
};
