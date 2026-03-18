export default async function handler(req, res) {
  const { user } = req.query;

  try {
    const response = await fetch("https://nitter.poast.org/" + user);
    const html = await response.text();

    const match = html.match(/class="tweet-content[^>]*>(.*?)<\/div>/);

    if (!match) {
      return res.status(200).json({ tweet: null });
    }

    let text = match[1]
      .replace(/<[^>]+>/g, "")
      .trim();

    res.status(200).json({ tweet: text });

  } catch (err) {
    res.status(500).json({ tweet: null });
  }
}
