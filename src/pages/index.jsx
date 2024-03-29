import Head from 'next/head';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, Spinner, YtVid } from '../Components';
import { deleteCookie } from 'cookies-next';
import { RiDeleteBin2Fill } from 'react-icons/ri';

export default function Home() {
    const [loaded, setLoaded] = useState(false);
    const [user, setUser] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [vid_ids, setVid_ids] = useState([]);

    async function fetchLogin() {
        return await axios.post('/api/checkLogin');
    }

    useEffect(() => {
        let loggedin = true;
        Promise.all([fetchLogin()]).then((res) => {
            if (res[0].data.success) {
                setUser(res[0].data.user);
                loggedin = true;
            } else {
                loggedin = false;
            }

            if (!loggedin) {
                window.location.href = '/login';
            } else {
                setLoaded(true);
            }
        });
    }, []);

    async function logOut() {
        setSubmitted(true);
        await axios.post('/api/logout');
        deleteCookie('token');
        window.location.href = '/';
    }

    function handleSubmit(event) {
        event.preventDefault();

        var link = event.target[0].value;
        var vid_id = '';

        if (link.includes('youtu.be')) {
            vid_id = link.substring(link.lastIndexOf('/'), link.length);
        } else if (link.includes('youtube.com/watch?v=')) {
            if (link.includes('&')) {
                var tmp = link.substring(link.indexOf('=') + 1, link.length);
                vid_id = tmp.substring(0, tmp.indexOf('&'));
            } else {
                vid_id = link.substring(link.indexOf('=') + 1, link.length);
            }
        }

        setVid_ids([...vid_ids, vid_id]);
    }

    function handleDelete(idx) {
        let tmp = [];

        for (let i = 0; i < vid_ids.length; i++) {
            if (i !== idx) {
                tmp.push(vid_ids[i]);
            }
        }

        setVid_ids(tmp);
    }

    function handleShare() {
        const link = document.getElementById('link');

        link.href = '/open?vids=' + vid_ids.toString();

        link.classList.remove('-z-10', 'absolute', 'left-0', 'top-0', 'opacity-0');
    }

    return (
        <main>
            <Head>
                <title>Youlist</title>
                <meta
                    name="description"
                    content="Create and share lists of Youtube videos"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex h-screen justify-center">
                {loaded ? (
                    <div className="w-screen">
                        <nav className="z-10 flex w-full items-center justify-between p-5 backdrop-blur-md">
                            <h1 className="text-xl font-light dark:text-white">
                                Youlist
                            </h1>
                            <div>
                                <Link
                                    text="Home"
                                    active={true}
                                    onClick={() => {
                                        window.location.href = '/';
                                    }}
                                />
                            </div>
                            <button
                                disabled={submitted}
                                onClick={logOut}
                                className="button"
                            >
                                {submitted ? (
                                    <div className="flex items-center">
                                        <Spinner className="mr-2 h-5 w-5 border-2 border-t-white dark:border-t-black" />
                                        <span>Please wait...</span>
                                    </div>
                                ) : (
                                    <span>Log out</span>
                                )}
                            </button>
                        </nav>

                        <div className="mt-10 flex flex-col items-center justify-center">
                            <h1 className="mb-10 text-5xl font-bold dark:text-white">
                                Hello, {user}
                            </h1>
                            <form
                                className="mb-5 flex flex-col items-center justify-center"
                                onSubmit={handleSubmit}
                            >
                                <input
                                    className="input mb-5"
                                    placeholder="Link to youtube video"
                                />
                                <a
                                    href=""
                                    id="link"
                                    className="absolute top-0 left-0 -z-10 mb-5 text-blue-500 opacity-0 transition-all duration-300 ease-in-out hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500"
                                >
                                    Link to your list
                                </a>
                                <div>
                                    <button type="submit" className="button mr-5">
                                        Add to list!
                                    </button>
                                    <button
                                        type="button"
                                        className="button"
                                        onClick={handleShare}
                                    >
                                        Share!
                                    </button>
                                </div>
                            </form>

                            {vid_ids.map((el, idx) => (
                                <div key={idx} className="mb-5 flex">
                                    <div className="mr-5 flex flex-col items-center">
                                        <h1 className="mb-2 text-2xl dark:text-white">
                                            {idx + 1}.
                                        </h1>
                                        <button
                                            className="buttonSimple"
                                            onClick={() => {
                                                handleDelete(idx);
                                            }}
                                        >
                                            <RiDeleteBin2Fill />
                                        </button>
                                    </div>
                                    <YtVid id={el} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-screen items-center">
                        <Spinner className="mr-3 h-10 w-10 border-4 border-t-black dark:border-t-white" />
                        <h1 className="text-5xl dark:text-white">Please wait...</h1>
                    </div>
                )}
            </div>
        </main>
    );
}
