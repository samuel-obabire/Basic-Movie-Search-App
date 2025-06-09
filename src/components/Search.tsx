type Props = {
    searchTerm: string,
    setSearchTerm: (searchTerm: string) => void
}

const Search = ({searchTerm, setSearchTerm}: Props) => {
    return (
        <div className="search">
            <div>
                <img src="/search.svg" alt="Search Icon"/>

                <input type="text" placeholder="Search for Movies" value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </div>
    );
};

export default Search;