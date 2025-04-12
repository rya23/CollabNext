import styles from './Loading.module.css';

export function Loading() {
    return (
        <div className="absolute w-screen h-screen flex justify-center items-center">
            <img src="https://liveblocks.io/loading.svg" alt="Loading" className="w-16 h-16 opacity-20" />
        </div>
    );
}
