
export default(req, res, next) => {
    console.log(req.method);
    res.status(404).json({error: "Not found"})
}