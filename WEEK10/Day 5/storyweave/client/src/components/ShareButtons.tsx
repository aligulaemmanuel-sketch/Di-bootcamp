export default function ShareButtons({ shareToken, title }: { shareToken: string; title: string }) {
  const url = `${window.location.origin}/share/${shareToken}`;
  const text = encodeURIComponent(`Read "${title}" on StoryWeave`);
  const encodedUrl = encodeURIComponent(url);

  async function copy() {
    await navigator.clipboard.writeText(url);
    alert("Share link copied!");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn btn-xs btn-outline" onClick={copy}>Copy link</button>
      <a className="btn btn-xs btn-outline" target="_blank" rel="noreferrer"
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`}>Share on X</a>
      <a className="btn btn-xs btn-outline" target="_blank" rel="noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>Share on Facebook</a>
    </div>
  );
}
