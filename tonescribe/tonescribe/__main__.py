import argparse
import os

import uvicorn


def main() -> None:
    parser = argparse.ArgumentParser(description="Tonescribe: transcribe music from YouTube, locally.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not args.no_browser:
        os.environ["TONESCRIBE_OPEN"] = f"http://{args.host}:{args.port}"
    uvicorn.run("tonescribe.server:app", host=args.host, port=args.port)


if __name__ == "__main__":
    main()
