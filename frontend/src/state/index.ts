import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface initialStateTypes{
    isSidebarButton: boolean
}

const initialState: initialStateTypes = {
    isSidebarButton: false
};

export const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        toggleSidebarButton: (state, action: PayloadAction<boolean>) => {
            state.isSidebarButton = action.payload;
    }
    },
});

export const { toggleSidebarButton } = globalSlice.actions;
export default globalSlice.reducer;  // export reducer