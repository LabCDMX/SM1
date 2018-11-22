const CHANGE_BLUR = 'CHANGE_BLUR'
const CHANGE_DIRECTION = 'CHANGE_DIRECTION'
const UPDATE_BUS_LOCATION = 'UPDATE_BUS_LOCATION'
const CHANGE_SELECTED_BUS = 'CHANGE_SELECTED_BUS'
const UPDATE_OPERATOR_ID = 'UPDATE_OPERATOR_ID'
const CHANGE_SELECTED_STATION = 'CHANGE_SELECTED_STATION'
const CHANGE_ROUTE_DATA = 'CHANGE_ROUTE_DATA'

export const changeBlur = (payload) => ({ type: CHANGE_BLUR, payload })
export const changeDirection = (payload) => ({ type: CHANGE_DIRECTION, payload})
export const updateBusLocation = (payload) => ({ type: UPDATE_BUS_LOCATION, payload })
export const updateSelectedBus = (payload) => ({ type: CHANGE_SELECTED_BUS, payload })
export const updateOperatorId = (payload) => ({ type: UPDATE_OPERATOR_ID, payload })
export const updateselectedStation = (payload) => ({ type: CHANGE_SELECTED_STATION, payload })
export const updateRouteData = (payload) => ({ type: CHANGE_ROUTE_DATA, payload })

const initalState = {
    blur: false,
    currentDirection: 'santa_fe',
    busses: [],
    selectedBus: null,
    userID: null,
    selectedStation: null,
    routeData: null,
};


export default (state = initalState, action) => {
    switch (action.type) {
        case CHANGE_BLUR:
        return {...state, blur: action.payload};
        case CHANGE_DIRECTION:
        return {...state, currentDirection: action.payload};
        case UPDATE_BUS_LOCATION:
        return {...state, busses: action.payload}
        case CHANGE_SELECTED_BUS:
        return {...state, selectedBus: action.payload}
        case CHANGE_SELECTED_STATION:
        return {...state, selectedStation: action.payload}
        case UPDATE_OPERATOR_ID:
        return {...state, userID: action.payload}
        case CHANGE_ROUTE_DATA:
        return {...state, routeData: action.payload}
        default:
        return state;
    }
    
}